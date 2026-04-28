"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";

const RejectInputSchema = z.object({
  entryId: z.string().uuid(),
  reason: z.string().min(1, "差戻し理由は必須です。").max(500),
});

/**
 * REPORT3 差戻し Server Action.
 * 承認権限ロール(leader / office / ceo / system)が、内容に問題がある日報を
 * 理由つきで差戻す。差戻し後はテーブルに rejected_at / rejected_by /
 * rejection_reason が記録され、作業員が確認できるようになる。
 *
 * 既に承認済みの日報は差戻しできない(整合性のため)。
 * 差戻し済みを再度差戻しすると、最新の理由で上書きされる。
 */
export async function rejectReport3(
  entryId: string,
  reason: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();

  if (!["leader", "office", "ceo", "system"].includes(session.role)) {
    return { ok: false, error: "差戻し権限がありません。" };
  }

  const parsed = RejectInputSchema.safeParse({ entryId, reason });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "入力エラーです。",
    };
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("report3_entries")
    .select("id, tenant_id, approved_at, user_id")
    .eq("id", parsed.data.entryId)
    .single();

  if (fetchError || !existing) {
    return { ok: false, error: "対象の日報が見つかりません。" };
  }

  if (existing.tenant_id !== session.tenantId) {
    return { ok: false, error: "他テナントの日報は差戻せません。" };
  }

  if (existing.approved_at) {
    return {
      ok: false,
      error: "既に承認済みの日報は差戻せません。承認を取り消してから操作してください。",
    };
  }

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("report3_entries")
    .update({
      rejected_at: now,
      rejected_by: session.userId,
      rejection_reason: parsed.data.reason,
    })
    .eq("id", parsed.data.entryId);

  if (updateError) {
    return { ok: false, error: "差戻しの保存に失敗しました。" };
  }

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "report3.rejected",
    target_type: "report3_entry",
    target_id: parsed.data.entryId,
    diff: { rejected_at: now, reason: parsed.data.reason },
  });

  revalidatePath("/pc/home");
  revalidatePath("/pc/approvals");
  revalidatePath("/pc/reports");
  revalidatePath("/sp/home");
  revalidatePath("/sp/approvals");
  revalidatePath(`/sp/report3/${parsed.data.entryId}`);

  return { ok: true };
}
