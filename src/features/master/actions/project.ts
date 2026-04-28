"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";
import {
  ProjectInputSchema,
  type ProjectActionResult,
} from "../schemas";

function ensureMasterRole(role: string): string | null {
  if (!["office", "ceo", "system"].includes(role)) {
    return "マスタを編集する権限がありません。";
  }
  return null;
}

function parseFormData(formData: FormData) {
  const amountRaw = String(formData.get("contractAmountCents") ?? "").trim();
  return ProjectInputSchema.safeParse({
    code: formData.get("code") ?? "",
    name: formData.get("name") ?? "",
    customerId: formData.get("customerId") ?? "",
    status: formData.get("status") ?? "active",
    startedAt: formData.get("startedAt") ?? "",
    endedAt: formData.get("endedAt") ?? "",
    contractAmountCents: amountRaw === "" ? "" : Number(amountRaw),
    note: formData.get("note") ?? "",
  });
}

export async function createProject(
  prev: ProjectActionResult,
  formData: FormData,
): Promise<ProjectActionResult> {
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
    .from("projects")
    .insert({
      tenant_id: session.tenantId,
      code: parsed.data.code || null,
      name: parsed.data.name,
      customer_id: parsed.data.customerId || null,
      status: parsed.data.status,
      started_at: parsed.data.startedAt || null,
      ended_at: parsed.data.endedAt || null,
      contract_amount_cents:
        typeof parsed.data.contractAmountCents === "number"
          ? parsed.data.contractAmountCents
          : null,
      note: parsed.data.note || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      formError:
        error?.code === "23505"
          ? "現場コードが他の現場と重複しています。"
          : "保存に失敗しました。もう一度お試しください。",
    };
  }

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "project.created",
    target_type: "project",
    target_id: data.id,
    diff: { name: parsed.data.name, code: parsed.data.code || null },
  });

  revalidatePath("/pc/projects");
  redirect("/pc/projects");
}

export async function updateProject(
  projectId: string,
  prev: ProjectActionResult,
  formData: FormData,
): Promise<ProjectActionResult> {
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
    .from("projects")
    .select("id, tenant_id")
    .eq("id", projectId)
    .maybeSingle();

  if (!existing) {
    return { ok: false, formError: "対象の現場が見つかりません。" };
  }
  if (existing.tenant_id !== session.tenantId) {
    return { ok: false, formError: "他テナントの現場は編集できません。" };
  }

  const { error } = await supabase
    .from("projects")
    .update({
      code: parsed.data.code || null,
      name: parsed.data.name,
      customer_id: parsed.data.customerId || null,
      status: parsed.data.status,
      started_at: parsed.data.startedAt || null,
      ended_at: parsed.data.endedAt || null,
      contract_amount_cents:
        typeof parsed.data.contractAmountCents === "number"
          ? parsed.data.contractAmountCents
          : null,
      note: parsed.data.note || null,
    })
    .eq("id", projectId);

  if (error) {
    return {
      ok: false,
      formError:
        error.code === "23505"
          ? "現場コードが他の現場と重複しています。"
          : "更新に失敗しました。",
    };
  }

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "project.updated",
    target_type: "project",
    target_id: projectId,
    diff: { name: parsed.data.name },
  });

  revalidatePath("/pc/projects");
  redirect("/pc/projects");
}
