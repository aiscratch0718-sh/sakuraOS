import { NextResponse } from "next/server";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  generateQuotePdf,
  type StampDef,
  type DocItem,
  type CompanyInfo,
} from "@/features/billing/pdf/generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// MVP の発行元情報。将来は document_templates または system_settings から読む。
const DEFAULT_COMPANY: CompanyInfo = {
  name: "さくら株式会社",
  registrationNumber: "T0000000000000",
  postalCode: "000-0000",
  address: "東京都〇〇区〇〇 1-2-3",
  tel: "00-0000-0000",
  fax: "00-0000-0001",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await requireSession();
  const supabase = await createClient();

  const [
    { data: est },
    { data: items },
    { data: stamps },
  ] = await Promise.all([
    supabase
      .from("estimates")
      .select(
        `
        id, tenant_id, estimate_no, title, issue_date, expiry_date,
        subtotal_cents, tax_rate, tax_cents, total_cents, note, stamps,
        print_company_stamp, print_staff_info, print_company_contact,
        customers(name, address, phone, contact_person),
        projects(name, delivery_due_date:ended_at)
        `,
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("estimate_items")
      .select("name, description, quantity, unit, unit_price_cents, amount_cents")
      .eq("estimate_id", id)
      .order("display_order", { ascending: true }),
    supabase
      .from("approval_stamps")
      .select(
        "stamp_key, display_name, role_name, image_path, is_company_stamp, is_active",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (!est) {
    return NextResponse.json({ error: "見積が見つかりません" }, { status: 404 });
  }
  if (est.tenant_id !== session.tenantId) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const customer = est.customers as unknown as
    | { name: string; address: string | null; phone: string | null; contact_person: string | null }
    | null;

  const selectedKeys = Object.entries((est.stamps as Record<string, boolean>) ?? {})
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
    const result = await generateQuotePdf({
      docNumber: est.estimate_no ?? est.id.slice(0, 8),
      title: est.title,
      issueDate: est.issue_date,
      expiryDate: est.expiry_date ?? undefined,
      customer: {
        name: customer?.name ?? "—",
        honorific: "御中",
        address: customer?.address ?? undefined,
        phone: customer?.phone ?? undefined,
        contactPerson: customer?.contact_person ?? undefined,
      },
      company: DEFAULT_COMPANY,
      items: docItems,
      subtotalYen: Math.round(Number(est.subtotal_cents) / 100),
      taxRate: Number(est.tax_rate),
      taxYen: Math.round(Number(est.tax_cents) / 100),
      totalYen: Math.round(Number(est.total_cents) / 100),
      note: est.note ?? undefined,
      selectedStamps,
      printCompanyStamp: est.print_company_stamp ?? true,
      printStaffInfo: est.print_staff_info ?? true,
      printCompanyContact: est.print_company_contact ?? true,
    });
    pdf = result.buffer;
    warnings = result.warnings;

    await supabase.from("pdf_generation_log").insert({
      tenant_id: session.tenantId,
      doc_type: "estimate",
      doc_id: id,
      generated_by: session.userId,
      status: warnings.length > 0 ? "warning" : "ok",
      warnings: warnings.length > 0 ? warnings : null,
    });

    await supabase.from("audit_log").insert({
      tenant_id: session.tenantId,
      actor_id: session.userId,
      action: "estimate.pdf_generated",
      target_type: "estimate",
      target_id: id,
      diff: { warnings },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await supabase.from("pdf_generation_log").insert({
      tenant_id: session.tenantId,
      doc_type: "estimate",
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

  const filename = `quote-${est.estimate_no ?? id.slice(0, 8)}.pdf`;
  // RFC 5987: 日本語ファイル名対策
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
