import { NextResponse } from "next/server";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * マネーフォワード給与向け 月次勤怠 CSV(MVP 簡易版)。
 *
 * 出力カラム:
 *   従業員ID, 氏名, 対象月, 稼働時間, 標準時給(円), 推定支給額(円)
 *
 * MVP の制約:
 * - 勤怠(打刻)モジュールが未実装のため、現時点では REPORT3 で記録された
 *   "稼働時間 × 時給" を月次集計する(残業/深夜割増は未対応)
 * - 勤怠モジュール実装後、本ルートをそちらの集計に切り替える
 */
export async function GET(req: Request) {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const url = new URL(req.url);
  const month = url.searchParams.get("month"); // YYYY-MM
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: "month=YYYY-MM 形式で指定してください" },
      { status: 400 },
    );
  }
  const monthStart = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const monthEnd = new Date(y!, m!, 0).toISOString().slice(0, 10); // 末日

  const supabase = await createClient();

  // 期間内に提出された日報を user_id でグループ化
  const { data: entries } = await supabase
    .from("report3_entries")
    .select("user_id, report3_rows(hours)")
    .gte("work_date", monthStart)
    .lte("work_date", monthEnd);

  const hoursByUser = new Map<string, number>();
  for (const e of entries ?? []) {
    const rows = (e.report3_rows as Array<{ hours: number }> | null) ?? [];
    const total = rows.reduce((s, r) => s + Number(r.hours), 0);
    hoursByUser.set(e.user_id, (hoursByUser.get(e.user_id) ?? 0) + total);
  }

  const userIds = Array.from(hoursByUser.keys());
  let profiles: Array<{
    id: string;
    display_name: string;
    hourly_rate_cents: number | null;
  }> = [];
  if (userIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, hourly_rate_cents")
      .in("id", userIds);
    profiles = data ?? [];
  }

  function csvField(s: string | number | null | undefined): string {
    const str = s == null ? "" : String(s);
    if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  }

  const headers = [
    "従業員ID",
    "氏名",
    "対象月",
    "稼働時間",
    "標準時給(円)",
    "推定支給額(円)",
  ];
  const lines = [headers.join(",")];

  for (const p of profiles) {
    const hours = hoursByUser.get(p.id) ?? 0;
    const rateYen =
      p.hourly_rate_cents != null
        ? Math.round(Number(p.hourly_rate_cents) / 100)
        : 0;
    const amount = Math.round(hours * rateYen);
    lines.push(
      [
        p.id.slice(0, 8),
        p.display_name,
        month,
        hours.toFixed(1),
        rateYen,
        amount,
      ]
        .map(csvField)
        .join(","),
    );
  }

  const csv = "﻿" + lines.join("\r\n");

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "payroll.mf_csv_exported",
    target_type: "report3_entry",
    diff: { month, count: profiles.length },
  });

  const filename = `mf-payroll-${month}.csv`;
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
