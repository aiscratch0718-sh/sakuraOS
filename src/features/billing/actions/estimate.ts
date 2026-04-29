"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";
import {
  EstimateInputSchema,
  computeTotals,
  type BillingActionResult,
} from "../schemas";

function ensureRole(role: string): string | null {
  if (!["office", "ceo", "system"].includes(role)) {
    return "見積を編集する権限がありません。";
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
  return EstimateInputSchema.safeParse({
    customerId: formData.get("customerId") ?? "",
    projectId: formData.get("projectId") ?? "",
    estimateNo: formData.get("estimateNo") ?? "",
    title: formData.get("title") ?? "",
    status: formData.get("status") ?? "draft",
    issueDate: formData.get("issueDate") ?? "",
    expiryDate: formData.get("expiryDate") ?? "",
    taxRate: formData.get("taxRate") ?? "0.1",
    note: formData.get("note") ?? "",
    items: itemsParsed,
  });
}

export async function createEstimate(
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
  const { data: estimate, error } = await supabase
    .from("estimates")
    .insert({
      tenant_id: session.tenantId,
      customer_id: parsed.data.customerId,
      project_id: parsed.data.projectId || null,
      estimate_no: parsed.data.estimateNo || null,
      title: parsed.data.title,
      status: parsed.data.status,
      issue_date: parsed.data.issueDate,
      expiry_date: parsed.data.expiryDate || null,
      subtotal_cents: subtotalCents,
      tax_rate: parsed.data.taxRate,
      tax_cents: taxCents,
      total_cents: totalCents,
      note: parsed.data.note || null,
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error || !estimate) {
    return { ok: false, formError: error?.message ?? "保存に失敗しました。" };
  }

  const { error: itemsError } = await supabase.from("estimate_items").insert(
    parsed.data.items.map((it, i) => ({
      estimate_id: estimate.id,
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
    await supabase.from("estimates").delete().eq("id", estimate.id);
    return { ok: false, formError: "明細の保存に失敗しました。" };
  }

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "estimate.created",
    target_type: "estimate",
    target_id: estimate.id,
    diff: { title: parsed.data.title, totalCents },
  });

  revalidatePath("/pc/estimates");
  redirect("/pc/estimates");
}

export async function updateEstimate(
  estimateId: string,
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
    .from("estimates")
    .select("id, tenant_id")
    .eq("id", estimateId)
    .maybeSingle();

  if (!existing || existing.tenant_id !== session.tenantId) {
    return { ok: false, formError: "対象の見積が見つかりません。" };
  }

  const { subtotalCents, taxCents, totalCents } = computeTotals(
    parsed.data.items,
    parsed.data.taxRate,
  );

  const { error: updError } = await supabase
    .from("estimates")
    .update({
      customer_id: parsed.data.customerId,
      project_id: parsed.data.projectId || null,
      estimate_no: parsed.data.estimateNo || null,
      title: parsed.data.title,
      status: parsed.data.status,
      issue_date: parsed.data.issueDate,
      expiry_date: parsed.data.expiryDate || null,
      subtotal_cents: subtotalCents,
      tax_rate: parsed.data.taxRate,
      tax_cents: taxCents,
      total_cents: totalCents,
      note: parsed.data.note || null,
    })
    .eq("id", estimateId);

  if (updError) {
    return { ok: false, formError: "更新に失敗しました。" };
  }

  // 明細は全置換(MVP の単純化)
  await supabase.from("estimate_items").delete().eq("estimate_id", estimateId);
  await supabase.from("estimate_items").insert(
    parsed.data.items.map((it, i) => ({
      estimate_id: estimateId,
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
    action: "estimate.updated",
    target_type: "estimate",
    target_id: estimateId,
    diff: { title: parsed.data.title, totalCents },
  });

  revalidatePath("/pc/estimates");
  redirect(`/pc/estimates/${estimateId}`);
}

/**
 * 見積を請求書に変換する(明細・金額をコピー、estimate_id でリンク)。
 */
export async function convertEstimateToInvoice(
  estimateId: string,
): Promise<{ ok: true; invoiceId: string } | { ok: false; error: string }> {
  const session = await requireSession();
  const roleError = ensureRole(session.role);
  if (roleError) return { ok: false, error: roleError };

  const supabase = await createClient();

  const { data: est } = await supabase
    .from("estimates")
    .select(
      "id, tenant_id, customer_id, project_id, title, subtotal_cents, tax_rate, tax_cents, total_cents, note",
    )
    .eq("id", estimateId)
    .maybeSingle();

  if (!est || est.tenant_id !== session.tenantId) {
    return { ok: false, error: "対象の見積が見つかりません。" };
  }

  const { data: items } = await supabase
    .from("estimate_items")
    .select(
      "display_order, name, description, quantity, unit, unit_price_cents, amount_cents",
    )
    .eq("estimate_id", estimateId);

  const today = new Date().toISOString().slice(0, 10);
  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      tenant_id: session.tenantId,
      customer_id: est.customer_id,
      project_id: est.project_id,
      estimate_id: estimateId,
      title: est.title,
      status: "draft",
      issue_date: today,
      subtotal_cents: est.subtotal_cents,
      tax_rate: est.tax_rate,
      tax_cents: est.tax_cents,
      total_cents: est.total_cents,
      note: est.note,
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error || !invoice) {
    return { ok: false, error: error?.message ?? "請求書の作成に失敗しました。" };
  }

  if (items && items.length > 0) {
    await supabase.from("invoice_items").insert(
      items.map((it) => ({
        invoice_id: invoice.id,
        display_order: it.display_order,
        name: it.name,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        unit_price_cents: it.unit_price_cents,
        amount_cents: it.amount_cents,
      })),
    );
  }

  await supabase.from("estimates").update({ status: "accepted" }).eq("id", estimateId);

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "invoice.created_from_estimate",
    target_type: "invoice",
    target_id: invoice.id,
    diff: { estimateId, totalCents: est.total_cents },
  });

  revalidatePath("/pc/estimates");
  revalidatePath("/pc/invoices");

  return { ok: true, invoiceId: invoice.id };
}
