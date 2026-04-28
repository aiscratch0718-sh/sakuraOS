"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";
import {
  CustomerInputSchema,
  type CustomerActionResult,
} from "../schemas";

function ensureMasterRole(role: string): string | null {
  if (!["office", "ceo", "system"].includes(role)) {
    return "マスタを編集する権限がありません。事務にお問い合わせください。";
  }
  return null;
}

function parseFormData(formData: FormData) {
  return CustomerInputSchema.safeParse({
    name: formData.get("name") ?? "",
    contactPerson: formData.get("contactPerson") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    address: formData.get("address") ?? "",
    note: formData.get("note") ?? "",
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCustomer(
  prev: CustomerActionResult,
  formData: FormData,
): Promise<CustomerActionResult> {
  void prev;
  const session = await requireSession();
  const roleError = ensureMasterRole(session.role);
  if (roleError) return { ok: false, formError: roleError };

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      tenant_id: session.tenantId,
      name: parsed.data.name,
      contact_person: parsed.data.contactPerson || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      note: parsed.data.note || null,
      is_active: parsed.data.isActive,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, formError: "保存に失敗しました。もう一度お試しください。" };
  }

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "customer.created",
    target_type: "customer",
    target_id: data.id,
    diff: { name: parsed.data.name },
  });

  revalidatePath("/pc/customers");
  redirect("/pc/customers");
}

export async function updateCustomer(
  customerId: string,
  prev: CustomerActionResult,
  formData: FormData,
): Promise<CustomerActionResult> {
  void prev;
  const session = await requireSession();
  const roleError = ensureMasterRole(session.role);
  if (roleError) return { ok: false, formError: roleError };

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("customers")
    .select("id, tenant_id")
    .eq("id", customerId)
    .maybeSingle();

  if (!existing) {
    return { ok: false, formError: "対象の客先が見つかりません。" };
  }
  if (existing.tenant_id !== session.tenantId) {
    return { ok: false, formError: "他テナントの客先は編集できません。" };
  }

  const { error } = await supabase
    .from("customers")
    .update({
      name: parsed.data.name,
      contact_person: parsed.data.contactPerson || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      note: parsed.data.note || null,
      is_active: parsed.data.isActive,
    })
    .eq("id", customerId);

  if (error) {
    return { ok: false, formError: "更新に失敗しました。" };
  }

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "customer.updated",
    target_type: "customer",
    target_id: customerId,
    diff: { name: parsed.data.name },
  });

  revalidatePath("/pc/customers");
  redirect("/pc/customers");
}
