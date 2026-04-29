import { NextResponse } from "next/server";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  generateInvoicePdf,
  type StampDef,
  type DocItem,
  type CompanyInfo,
} from "@/features/billing/pdf/generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_COMPANY: CompanyInfo = {
  name: "さくら株式会社",
  registrationNumber: "T0000000000000",
  postalCode: "000-0000",
  address: "東京都〇〇区〇〇 1-2-3",
  tel: "00-0000-0000",
  fax: "00-0000-0001",
  bankName: "〇〇銀行",
  bankBranch: "〇〇支店",
  bankAccountType: "普通",
  bankAccountNumber: "1234567",
  bankAccountHolder: "サクラ(カ",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await requireSession();
  const supabase = await createClient();

  const [
    { data: inv },
    { data: items },
    { data: stamps },
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select(
        `
        id, tenant_id, invoice_no, title, issue_date, due_date,
        subtotal_cents, tax_rate, tax_cents, total_cents, note, stamps,
        print_company_stamp, print_staff_info, print_company_contact,
        customers(name, address, phone, contact_person)
        `,
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("invoice_items")
      .select("name, description, quantity, unit, unit_price_cents, amount_cents")
      .eq("invoice_id", id)
      .order("display_order", { ascending: true }),
    supabase
      .from("approval_stamps")
      .select(
        "stamp_key, display_name, role_name, image_path, is_company_stamp, is_active",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (!inv) {
    return NextResponse.json({ error: "請求書が見つかりません" }, { status: 404 });
  }
  if (inv.tenant_id !== session.tenantId) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const customer = inv.customers as unknown as
    | { name: string; address: string | null; phone: string | null; contact_person: string | null }
    | null;

  const selectedKeys = Object.entries((inv.stamps as Record<string, boolean>) ?? {})
    .filter(([, v]) => v === true)
    .map(([k]) => k);

  const selectedStamps: StampDef[] = (stamps ?? [])
    .filter((s) => selectedKeys.includes(s.stamp_key))
    .map((s) => ({
      stampKey: s.stamp_key,
      displayName: s.display_name,
      roleName: s.role_name,
      imagePath: s.image_path,
      isCompanyStamp: s.is_company_stamp,
    }));

  const docItems: DocItem[] = (items ?? []).map((it) => ({
    name: it.name,
    description: it.description,
    quantity: Number(it.quantity),
    unit: it.unit,
    unitPriceYen: Math.round(Number(it.unit_price_cents) / 100),
    amountYen: Math.round(Number(it.amount_cents) / 100),
  }));

  let pdf: Buffer;
  let warnings: { type: string; message: string }[] = [];
  try {
    const result = await generateInvoicePdf({
      docNumber: inv.invoice_no ?? inv.id.slice(0, 8),
      title: inv.title,
      issueDate: inv.issue_date,
      dueDate: inv.due_date ?? undefined,
      customer: {
        name: customer?.name ?? "—",
        honorific: "御中",
        address: customer?.address ?? undefined,
        phone: customer?.phone ?? undefined,
        contactPerson: customer?.contact_person ?? undefined,
      },
      company: DEFAULT_COMPANY,
      items: docItems,
      subtotalYen: Math.round(Number(inv.subtotal_cents) / 100),
      taxRate: Number(inv.tax_rate),
      taxYen: Math.round(Number(inv.tax_cents) / 100),
      totalYen: Math.round(Number(inv.total_cents) / 100),
      note: inv.note ?? undefined,
      selectedStamps,
      printCompanyStamp: inv.print_company_stamp ?? true,
      printStaffInfo: inv.print_staff_info ?? true,
      printCompanyContact: inv.print_company_contact ?? true,
    });
    pdf = result.buffer;
    warnings = result.warnings;

    await supabase.from("pdf_generation_log").insert({
      tenant_id: session.tenantId,
      doc_type: "invoice",
      doc_id: id,
      generated_by: session.userId,
      status: warnings.length > 0 ? "warning" : "ok",
      warnings: warnings.length > 0 ? warnings : null,
    });

    await supabase.from("audit_log").insert({
      tenant_id: session.tenantId,
      actor_id: session.userId,
      action: "invoice.pdf_generated",
      target_type: "invoice",
      target_id: id,
      diff: { warnings },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await supabase.from("pdf_generation_log").insert({
      tenant_id: session.tenantId,
      doc_type: "invoice",
      doc_id: id,
      generated_by: session.userId,
      status: "error",
      error_message: message,
    });
    return NextResponse.json(
      { error: "PDF 生成に失敗しました", detail: message },
      { status: 500 },
    );
  }

  const filename = `invoice-${inv.invoice_no ?? id.slice(0, 8)}.pdf`;
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
