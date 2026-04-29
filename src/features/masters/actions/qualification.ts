"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";

const QualInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().max(40).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

const UserQualInputSchema = z.object({
  userId: z.string().uuid(),
  qualificationId: z.string().uuid(),
  acquiredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  certificateNumber: z.string().trim().max(60).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export type QualActionResult =
  | { ok: true; id: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };

function ensureMaster(role: string) {
  if (!["office", "ceo", "system"].includes(role))
    return "資格マスタを編集する権限がありません。";
  return null;
}

export async function createQualification(
  prev: QualActionResult,
  formData: FormData,
): Promise<QualActionResult> {
  void prev;
  const session = await requireSession();
  const roleError = ensureMaster(session.role);
  if (roleError) return { ok: false, formError: roleError };

  const parsed = QualInputSchema.safeParse({
    name: formData.get("name") ?? "",
    category: formData.get("category") ?? "",
    description: formData.get("description") ?? "",
  });
  if (!parsed.success)
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("qualifications")
    .insert({
      tenant_id: session.tenantId,
      name: parsed.data.name,
      category: parsed.data.category || null,
      description: parsed.data.description || null,
    })
    .select("id")
    .single();
  if (error || !data)
    return {
      ok: false,
      formError:
        error?.code === "23505"
          ? "同名の資格が既にあります。"
          : (error?.message ?? "保存に失敗しました。"),
    };

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "qualification.created",
    target_type: "qualification",
    target_id: data.id,
    diff: { name: parsed.data.name },
  });

  revalidatePath("/pc/qualifications");
  redirect("/pc/qualifications");
}

export async function grantUserQualification(
  prev: QualActionResult,
  formData: FormData,
): Promise<QualActionResult> {
  void prev;
  const session = await requireSession();
  const roleError = ensureMaster(session.role);
  if (roleError) return { ok: false, formError: roleError };

  const parsed = UserQualInputSchema.safeParse({
    userId: formData.get("userId") ?? "",
    qualificationId: formData.get("qualificationId") ?? "",
    acquiredAt: formData.get("acquiredAt") ?? "",
    expiresAt: formData.get("expiresAt") ?? "",
    certificateNumber: formData.get("certificateNumber") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success)
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_qualifications")
    .insert({
      tenant_id: session.tenantId,
      user_id: parsed.data.userId,
      qualification_id: parsed.data.qualificationId,
      acquired_at: parsed.data.acquiredAt || null,
      expires_at: parsed.data.expiresAt || null,
      certificate_number: parsed.data.certificateNumber || null,
      note: parsed.data.note || null,
    })
    .select("id")
    .single();
  if (error || !data)
    return {
      ok: false,
      formError:
        error?.code === "23505"
          ? "このユーザーには既に同じ資格が登録されています。"
          : (error?.message ?? "保存に失敗しました。"),
    };

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "user_qualification.granted",
    target_type: "user_qualification",
    target_id: data.id,
    diff: parsed.data,
  });

  revalidatePath(`/pc/users/${parsed.data.userId}`);
  return { ok: true, id: data.id };
}
