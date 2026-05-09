"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";

const SafetyDocSchema = z.object({
  projectId: z.string().uuid(),
  recipientType: z.enum(["contractor", "subcontractor"]),
  recipientName: z.string().trim().min(1).max(120),
  documentName: z.string().trim().min(1).max(160),
  fileUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "submitted", "approved"]).default("draft"),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export type SafetyDocResult =
  | { ok: true; id: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };

function ensureWrite(role: string) {
  if (!["office", "ceo", "system"].includes(role)) {
    return "安全書類を編集する権限がありません。";
  }
  return null;
}

export async function createSafetyDoc(
  prev: SafetyDocResult,
  formData: FormData,
): Promise<SafetyDocResult> {
  void prev;
  const session = await requireSession();
  const err = ensureWrite(session.role);
  if (err) return { ok: false, formError: err };

  const parsed = SafetyDocSchema.safeParse({
    projectId: formData.get("projectId") ?? "",
    recipientType: formData.get("recipientType") ?? "contractor",
    recipientName: formData.get("recipientName") ?? "",
    documentName: formData.get("documentName") ?? "",
    fileUrl: formData.get("fileUrl") ?? "",
    status: formData.get("status") ?? "draft",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const sb = await createClient();
  const { data, error } = await sb
    .from("safety_documents")
    .insert({
      tenant_id: session.tenantId,
      project_id: parsed.data.projectId,
      recipient_type: parsed.data.recipientType,
      recipient_name: parsed.data.recipientName,
      document_name: parsed.data.documentName,
      file_url: parsed.data.fileUrl || null,
      status: parsed.data.status,
      submitted_at: parsed.data.status === "submitted" ? new Date().toISOString() : null,
      note: parsed.data.note || null,
      created_by: session.userId,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, formError: error?.message ?? "保存に失敗しました。" };

  await sb.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "safety_document.created",
    target_type: "safety_document",
    target_id: data.id,
    diff: {
      project_id: parsed.data.projectId,
      recipient: parsed.data.recipientName,
      document: parsed.data.documentName,
      status: parsed.data.status,
    },
  });

  revalidatePath("/pc/safety-documents");
  redirect("/pc/safety-documents");
}

export async function updateSafetyDocStatus(
  id: string,
  status: "draft" | "submitted" | "approved",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const err = ensureWrite(session.role);
  if (err) return { ok: false, error: err };

  const sb = await createClient();
  const { error } = await sb
    .from("safety_documents")
    .update({
      status,
      submitted_at: status === "submitted" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await sb.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: `safety_document.${status}`,
    target_type: "safety_document",
    target_id: id,
  });

  revalidatePath("/pc/safety-documents");
  return { ok: true };
}

const TemplateSchema = z.object({
  customerId: z.string().uuid(),
  templateName: z.string().trim().min(1).max(120),
  templateUrl: z.string().url(),
  templateType: z.string().trim().max(40).optional().or(z.literal("")),
});

export async function uploadContractorTemplate(
  prev: SafetyDocResult,
  formData: FormData,
): Promise<SafetyDocResult> {
  void prev;
  const session = await requireSession();
  const err = ensureWrite(session.role);
  if (err) return { ok: false, formError: err };

  const parsed = TemplateSchema.safeParse({
    customerId: formData.get("customerId") ?? "",
    templateName: formData.get("templateName") ?? "",
    templateUrl: formData.get("templateUrl") ?? "",
    templateType: formData.get("templateType") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const sb = await createClient();
  const { data, error } = await sb
    .from("contractor_templates")
    .insert({
      tenant_id: session.tenantId,
      customer_id: parsed.data.customerId,
      template_name: parsed.data.templateName,
      template_url: parsed.data.templateUrl,
      template_type: parsed.data.templateType || null,
      uploaded_by: session.userId,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, formError: error?.message ?? "保存に失敗しました。" };

  await sb.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "contractor_template.uploaded",
    target_type: "contractor_template",
    target_id: data.id,
    diff: { customer_id: parsed.data.customerId, name: parsed.data.templateName },
  });

  revalidatePath("/pc/contractor-templates");
  redirect("/pc/contractor-templates");
}

export async function recordTemplateUsed(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const err = ensureWrite(session.role);
  if (err) return { ok: false, error: err };

  const sb = await createClient();
  const { data: t } = await sb
    .from("contractor_templates")
    .select("used_count")
    .eq("id", id)
    .maybeSingle();
  const newCount = (t?.used_count ?? 0) + 1;

  const { error } = await sb
    .from("contractor_templates")
    .update({ used_count: newCount, last_used_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
