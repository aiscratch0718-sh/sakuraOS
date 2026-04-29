import { NextResponse } from "next/server";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * マネーフォワード会計向け 連携用 CSV エクスポート(MVP 簡易版)。
 *
 * MF 公式の取込フォーマット(売上仕訳)に近い列構成で出力:
 *   取引日, 借方勘定科目, 借方金額, 貸方勘定科目, 貸方金額, 摘要, 取引先, 番号
 *
 * 借方=売掛金 / 貸方=売上 として 1 請求書 1 行で出力。税はまとめて 1 行に
 * 含める簡略版。詳細仕訳は実運用に合わせて要拡張。
 */
export async function GET(req: Request) {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;
  const onlyPaid = url.searchParams.get("onlyPaid") === "1";

  const supabase = await createClient();

  let query = supabase
    .from("invoices")
    .select(
      "id, invoice_no, title, status, issue_date, total_cents, customer_id, customers(name)",
    )
    .order("issue_date", { ascending: true });

  if (from) query = query.gte("issue_date", from);
  if (to) query = query.lte("issue_date", to);
  if (onlyPaid) query = query.eq("status", "paid");
  // draft / voided は除外
  query = query.not("status", "in", "(draft,voided)");

  const { data: invoices, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  function csvField(s: string | number | null | undefined): string {
    const str = s == null ? "" : String(s);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const headers = [
    "取引日",
    "借方勘定科目",
    "借方金額(税込)",
    "貸方勘定科目",
    "貸方金額(税込)",
    "摘要",
    "取引先",
    "請求番号",
  ];
  const lines: string[] = [headers.join(",")];

  for (const inv of invoices ?? []) {
    const customerName =
      (inv.customers as { name?: string } | null)?.name ?? "";
    const totalYen = Math.round(Number(inv.total_cents) / 100);
    lines.push(
      [
        inv.issue_date,
        "売掛金",
        totalYen,
        "売上高",
        totalYen,
        inv.title,
        customerName,
        inv.invoice_no ?? "",
      ]
        .map(csvField)
        .join(","),
    );
  }

  const csv = "﻿" + lines.join("\r\n");

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "invoice.mf_csv_exported",
    target_type: "invoice",
    diff: {
      filter: { from, to, onlyPaid },
      count: invoices?.length ?? 0,
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const filename = `mf-invoices-${today}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
