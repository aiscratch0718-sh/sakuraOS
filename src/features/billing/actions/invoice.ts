"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";
import {
  InvoiceInputSchema,
  computeTotals,
  type BillingActionResult,
} from "../schemas";

function ensureRole(role: string): string | null {
  if (!["office", "ceo", "system"].includes(role)) {
    return "請求書を編集する権限がありません。";
  }
  return null;
}

function parseFormData(formData: FormData) {
  let itemsParsed: unknown;
  try {
    itemsParsed = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    itemsParsed = [];
  }
  let stampsParsed: unknown;
  try {
    stampsParsed = JSON.parse(String(formData.get("stamps") ?? "{}"));
  } catch {
    stampsParsed = {};
  }
  return InvoiceInputSchema.safeParse({
    customerId: formData.get("customerId") ?? "",
    projectId: formData.get("projectId") ?? "",
    estimateId: formData.get("estimateId") ?? "",
    invoiceNo: formData.get("invoiceNo") ?? "",
    title: formData.get("title") ?? "",
    status: formData.get("status") ?? "draft",
    issueDate: formData.get("issueDate") ?? "",
    dueDate: formData.get("dueDate") ?? "",
    taxRate: formData.get("taxRate") ?? "0.1",
    note: formData.get("note") ?? "",
    items: itemsParsed,
    stamps: stampsParsed,
    printCompanyStamp: formData.get("printCompanyStamp") === "on",
    printStaffInfo: formData.get("printStaffInfo") === "on",
    printCompanyContact: formData.get("printCompanyContact") === "on",
  });
}

export async function createInvoice(
  prev: BillingActionResult,
  formData: FormData,
): Promise<BillingActionResult> {
  void prev;
  const session = await requireSession();
  const roleError = ensureRole(session.role);
  if (roleError) return { ok: false, formError: roleError };

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { subtotalCents, taxCents, totalCents } = computeTotals(
    parsed.data.items,
    parsed.data.taxRate,
  );

  const supabase = await createClient();

  let invoiceNo = parsed.data.invoiceNo || null;
  if (!invoiceNo) {
    const ym = new Date()
      .toLocaleDateString("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
      })
      .replace(/[^\d]/g, "");
    const { data: nextNo } = await supabase.rpc("next_doc_number", {
      p_tenant_id: session.tenantId,
      p_doc_type: "invoice",
      p_year_month: ym,
    });
    if (nextNo) invoiceNo = nextNo as string;
  }

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      tenant_id: session.tenantId,
      customer_id: parsed.data.customerId,
      project_id: parsed.data.projectId || null,
      estimate_id: parsed.data.estimateId || null,
      invoice_no: invoiceNo,
      title: parsed.data.title,
      status: parsed.data.status,
      issue_date: parsed.data.issueDate,
      due_date: parsed.data.dueDate || null,
      subtotal_cents: subtotalCents,
      tax_rate: parsed.data.taxRate,
      tax_cents: taxCents,
      total_cents: totalCents,
      note: parsed.data.note || null,
      stamps: parsed.data.stamps,
      print_company_stamp: parsed.data.printCompanyStamp,
      print_staff_info: parsed.data.printStaffInfo,
      print_company_contact: parsed.data.printCompanyContact,
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error || !invoice) {
    return { ok: false, formError: error?.message ?? "保存に失敗しました。" };
  }

  const { error: itemsError } = await supabase.from("invoice_items").insert(
    parsed.data.items.map((it, i) => ({
      invoice_id: invoice.id,
      display_order: i,
      name: it.name,
      description: it.description || null,
      quantity: it.quantity,
      unit: it.unit || null,
      unit_price_cents: it.unitPriceYen * 100,
      amount_cents: Math.round(it.quantity * it.unitPriceYen * 100),
    })),
  );

  if (itemsError) {
    await supabase.from("invoices").delete().eq("id", invoice.id);
    return { ok: false, formError: "明細の保存に失敗しました。" };
  }

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "invoice.created",
    target_type: "invoice",
    target_id: invoice.id,
    diff: { title: parsed.data.title, totalCents },
  });

  revalidatePath("/pc/invoices");
  redirect("/pc/invoices");
}

export async function updateInvoice(
  invoiceId: string,
  prev: BillingActionResult,
  formData: FormData,
): Promise<BillingActionResult> {
  void prev;
  const session = await requireSession();
  const roleError = ensureRole(session.role);
  if (roleError) return { ok: false, formError: roleError };

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("invoices")
    .select("id, tenant_id")
    .eq("id", invoiceId)
    .maybeSingle();

  if (!existing || existing.tenant_id !== session.tenantId) {
    return { ok: false, formError: "対象の請求書が見つかりません。" };
  }

  const { subtotalCents, taxCents, totalCents } = computeTotals(
    parsed.data.items,
    parsed.data.taxRate,
  );

  const { error: updError } = await supabase
    .from("invoices")
    .update({
      customer_id: parsed.data.customerId,
      project_id: parsed.data.projectId || null,
      estimate_id: parsed.data.estimateId || null,
      invoice_no: parsed.data.invoiceNo || null,
      title: parsed.data.title,
      status: parsed.data.status,
      issue_date: parsed.data.issueDate,
      due_date: parsed.data.dueDate || null,
      subtotal_cents: subtotalCents,
      tax_rate: parsed.data.taxRate,
      tax_cents: taxCents,
      total_cents: totalCents,
      note: parsed.data.note || null,
      stamps: parsed.data.stamps,
      print_company_stamp: parsed.data.printCompanyStamp,
      print_staff_info: parsed.data.printStaffInfo,
      print_company_contact: parsed.data.printCompanyContact,
    })
    .eq("id", invoiceId);

  if (updError) {
    return { ok: false, formError: "更新に失敗しました。" };
  }

  await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
  await supabase.from("invoice_items").insert(
    parsed.data.items.map((it, i) => ({
      invoice_id: invoiceId,
      display_order: i,
      name: it.name,
      description: it.description || null,
      quantity: it.quantity,
      unit: it.unit || null,
      unit_price_cents: it.unitPriceYen * 100,
      amount_cents: Math.round(it.quantity * it.unitPriceYen * 100),
    })),
  );

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "invoice.updated",
    target_type: "invoice",
    target_id: invoiceId,
    diff: { title: parsed.data.title, totalCents },
  });

  revalidatePath("/pc/invoices");
  redirect(`/pc/invoices/${invoiceId}`);
}

/**
 * 請求書のステータスを「支払済」に変更。
 */
export async function markInvoicePaid(
  invoiceId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const roleError = ensureRole(session.role);
  if (roleError) return { ok: false, error: roleError };

  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ status: "paid" })
    .eq("id", invoiceId);

  if (error) return { ok: false, error: error.message };

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "invoice.paid",
    target_type: "invoice",
    target_id: invoiceId,
    diff: { status: "paid" },
  });

  revalidatePath("/pc/invoices");
  return { ok: true };
}
