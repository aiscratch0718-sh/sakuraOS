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

  const [{ data: inv }, { data: items }] = await Promise.all([
    supabase
      .from("invoices")
      .select(
        "id, tenant_id, invoice_no, title, issue_date, due_date, subtotal_cents, tax_rate, tax_cents, total_cents, note, customers(name, address)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("invoice_items")
      .select("name, description, quantity, unit, unit_price_cents, amount_cents")
      .eq("invoice_id", id)
      .order("display_order", { ascending: true }),
  ]);

  if (!inv) return NextResponse.json({ error: "請求書が見つかりません" }, { status: 404 });
  if (inv.tenant_id !== session.tenantId)
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });

  const customer = inv.customers as unknown as
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
    kind: "invoice",
    docNumber: inv.invoice_no ?? inv.id.slice(0, 8),
    title: inv.title,
    issueDate: inv.issue_date,
    expiryOrDueDate: inv.due_date ?? undefined,
    customerName: customer?.name ?? "—",
    customerAddress: customer?.address ?? undefined,
    companyName: COMPANY_NAME,
    items: excelItems,
    subtotalYen: Math.round(Number(inv.subtotal_cents) / 100),
    taxRate: Number(inv.tax_rate),
    taxYen: Math.round(Number(inv.tax_cents) / 100),
    totalYen: Math.round(Number(inv.total_cents) / 100),
    note: inv.note ?? undefined,
  });

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "invoice.excel_exported",
    target_type: "invoice",
    target_id: id,
    diff: {},
  });

  const filename = `invoice-${inv.invoice_no ?? id.slice(0, 8)}.xlsx`;
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
