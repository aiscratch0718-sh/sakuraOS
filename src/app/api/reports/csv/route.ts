import { NextResponse } from "next/server";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 日報 CSV エクスポート(/pc/reports と同じフィルタを query string で受ける)。
 *
 * 出力カラム:
 *   作業日, 作業員, 現場, 大分類, 中分類, 小分類, 時間, メモ, 状態
 *
 * 1 件の REPORT3 が複数明細を持つので、明細単位で行を展開する。
 * BOM 付き UTF-8 で Excel が直接開けるようにする。
 */
export async function GET(req: Request) {
  const session = await requireSession();
  if (!["leader", "office", "ceo", "system"].includes(session.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;
  const projectId = url.searchParams.get("project") ?? undefined;
  const userId = url.searchParams.get("user") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;

  const supabase = await createClient();

  let query = supabase
    .from("report3_entries")
    .select(
      `
      id, work_date, requires_leader_approval, approved_at, rejected_at,
      project_id, projects(name),
      submitter:profiles!report3_entries_user_id_fkey(display_name),
      report3_rows(l1, l2, l3, hours, memo)
      `,
    )
    .order("work_date", { ascending: false })
    .limit(2000);

  if (from) query = query.gte("work_date", from);
  if (to) query = query.lte("work_date", to);
  if (projectId) query = query.eq("project_id", projectId);
  if (userId) query = query.eq("user_id", userId);
  switch (status) {
    case "pending":
      query = query
        .eq("requires_leader_approval", true)
        .is("approved_at", null)
        .is("rejected_at", null);
      break;
    case "approved":
      query = query.not("approved_at", "is", null);
      break;
    case "rejected":
      query = query.not("rejected_at", "is", null);
      break;
    case "submitted":
      query = query
        .eq("requires_leader_approval", false)
        .is("rejected_at", null);
      break;
  }

  const { data: reports, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  function statusLabel(r: {
    approved_at: string | null;
    rejected_at: string | null;
    requires_leader_approval: boolean;
  }): string {
    if (r.rejected_at) return "差戻し";
    if (r.approved_at) return "承認済";
    if (r.requires_leader_approval) return "要承認";
    return "提出済";
  }

  function csvField(s: string | number | null | undefined): string {
    const str = s == null ? "" : String(s);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const headers = [
    "作業日",
    "作業員",
    "現場",
    "大分類",
    "中分類",
    "小分類",
    "時間",
    "メモ",
    "状態",
  ];
  const lines: string[] = [headers.join(",")];

  for (const entry of reports ?? []) {
    const projectName =
      (entry.projects as { name?: string } | null)?.name ?? "";
    const userName =
      (entry.submitter as { display_name?: string } | null)?.display_name ?? "";
    const status = statusLabel(entry);
    const rows = (entry.report3_rows as Array<{
      l1: string;
      l2: string;
      l3: string;
      hours: number;
      memo: string | null;
    }> | null) ?? [];

    if (rows.length === 0) {
      // 明細ゼロでも 1 行は出す
      lines.push(
        [
          entry.work_date,
          userName,
          projectName,
          "",
          "",
          "",
          "",
          "",
          status,
        ]
          .map(csvField)
          .join(","),
      );
      continue;
    }

    for (const r of rows) {
      lines.push(
        [
          entry.work_date,
          userName,
          projectName,
          r.l1,
          r.l2,
          r.l3,
          Number(r.hours),
          r.memo ?? "",
          status,
        ]
          .map(csvField)
          .join(","),
      );
    }
  }

  // BOM 付き UTF-8 で出力(Excel がそのまま開ける)
  const csv = "﻿" + lines.join("\r\n");

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "report3.csv_exported",
    target_type: "report3_entry",
    diff: {
      filter: { from, to, projectId, userId, status },
      count: reports?.length ?? 0,
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const filename = `reports-${today}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
