import { NextResponse } from "next/server";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { generateBillingExcel } from "@/features/billing/excel/generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COMPANY_NAME = "さくら株式会社";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await requireSession();
  const supabase = await createClient();

  const [{ data: est }, { data: items }] = await Promise.all([
    supabase
      .from("estimates")
      .select(
        "id, tenant_id, estimate_no, title, issue_date, expiry_date, subtotal_cents, tax_rate, tax_cents, total_cents, note, customers(name, address)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("estimate_items")
      .select("name, description, quantity, unit, unit_price_cents, amount_cents")
      .eq("estimate_id", id)
      .order("display_order", { ascending: true }),
  ]);

  if (!est) return NextResponse.json({ error: "見積が見つかりません" }, { status: 404 });
  if (est.tenant_id !== session.tenantId)
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });

  const customer = est.customers as unknown as
    | { name: string; address: string | null }
    | null;

  const excelItems = (items ?? []).map((it) => ({
    name: it.name,
    description: it.description,
    quantity: Number(it.quantity),
    unit: it.unit,
    unitPriceYen: Math.round(Number(it.unit_price_cents) / 100),
    amountYen: Math.round(Number(it.amount_cents) / 100),
  }));

  const buf = await generateBillingExcel({
    kind: "quote",
    docNumber: est.estimate_no ?? est.id.slice(0, 8),
    title: est.title,
    issueDate: est.issue_date,
    expiryOrDueDate: est.expiry_date ?? undefined,
    customerName: customer?.name ?? "—",
    customerAddress: customer?.address ?? undefined,
    companyName: COMPANY_NAME,
    items: excelItems,
    subtotalYen: Math.round(Number(est.subtotal_cents) / 100),
    taxRate: Number(est.tax_rate),
    taxYen: Math.round(Number(est.tax_cents) / 100),
    totalYen: Math.round(Number(est.total_cents) / 100),
    note: est.note ?? undefined,
  });

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "estimate.excel_exported",
    target_type: "estimate",
    target_id: id,
    diff: {},
  });

  const filename = `quote-${est.estimate_no ?? id.slice(0, 8)}.xlsx`;
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
