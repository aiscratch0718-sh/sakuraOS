"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";
import {
  CreateUserInputSchema,
  UpdateUserInputSchema,
  type UserActionResult,
} from "../schemas-user";

function ensureAdminRole(role: string): string | null {
  if (!["office", "ceo", "system"].includes(role)) {
    return "ユーザーマスタを編集する権限がありません。";
  }
  return null;
}

/**
 * ユーザー新規作成。
 * Auth ユーザーの作成には service_role が必要なため、Supabase Edge Function
 * (`create-user`)経由で行う。Edge Function 側で:
 *   - 呼び出し元 JWT から user を確認
 *   - office/ceo/system ロールであることを再検証
 *   - service_role で auth.admin.createUser → profiles insert
 *   - 失敗時は auth ユーザーをロールバック
 *   - audit_log に user.created を記録
 */
export async function createUserAction(
  prev: UserActionResult,
  formData: FormData,
): Promise<UserActionResult> {
  void prev;
  const session = await requireSession();
  const roleError = ensureAdminRole(session.role);
  if (roleError) return { ok: false, formError: roleError };

  const parsed = CreateUserInputSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    displayName: formData.get("displayName") ?? "",
    role: formData.get("role") ?? "worker",
    hourlyRateYen: formData.get("hourlyRateYen") ?? undefined,
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const hourlyRateCents =
    typeof parsed.data.hourlyRateYen === "number"
      ? parsed.data.hourlyRateYen * 100
      : null;

  const { data, error } = await supabase.functions.invoke<{
    ok?: boolean;
    userId?: string;
    error?: string;
  }>("create-user", {
    body: {
      email: parsed.data.email,
      password: parsed.data.password,
      displayName: parsed.data.displayName,
      role: parsed.data.role,
      hourlyRateCents,
    },
  });

  if (error) {
    return { ok: false, formError: error.message ?? "ユーザー作成に失敗しました。" };
  }
  if (!data?.ok || !data.userId) {
    return { ok: false, formError: data?.error ?? "ユーザー作成に失敗しました。" };
  }

  revalidatePath("/pc/users");
  redirect("/pc/users");
}

/**
 * ユーザー情報の編集(表示名 / ロール / 時給)。
 * profiles テーブルの直接更新で済む(RLS の office/ceo update ポリシーで許可)。
 */
export async function updateUserAction(
  userId: string,
  prev: UserActionResult,
  formData: FormData,
): Promise<UserActionResult> {
  void prev;
  const session = await requireSession();
  const roleError = ensureAdminRole(session.role);
  if (roleError) return { ok: false, formError: roleError };

  const parsed = UpdateUserInputSchema.safeParse({
    displayName: formData.get("displayName") ?? "",
    role: formData.get("role") ?? "worker",
    hourlyRateYen: formData.get("hourlyRateYen") ?? undefined,
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, tenant_id")
    .eq("id", userId)
    .maybeSingle();

  if (!existing) {
    return { ok: false, formError: "対象のユーザーが見つかりません。" };
  }
  if (existing.tenant_id !== session.tenantId) {
    return { ok: false, formError: "他テナントのユーザーは編集できません。" };
  }

  const hourlyRateCents =
    typeof parsed.data.hourlyRateYen === "number"
      ? parsed.data.hourlyRateYen * 100
      : null;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      role: parsed.data.role,
      hourly_rate_cents: hourlyRateCents,
    })
    .eq("id", userId);

  if (error) {
    return { ok: false, formError: "更新に失敗しました。" };
  }

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "user.updated",
    target_type: "profile",
    target_id: userId,
    diff: {
      displayName: parsed.data.displayName,
      role: parsed.data.role,
      hourlyRateCents,
    },
  });

  revalidatePath("/pc/users");
  redirect("/pc/users");
}
