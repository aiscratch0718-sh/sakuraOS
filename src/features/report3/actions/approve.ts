"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";

/**
 * REPORT3 リーダー承認 Server Action.
 *
 * Phase B: leader / office / ceo のいずれかロールがあれば承認可能。
 * 重複呼び出しは安全(既に承認済みなら no-op を返す)。
 */
export async function approveReport3(
  entryId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();

  if (!["leader", "office", "ceo", "system"].includes(session.role)) {
    return { ok: false, error: "承認権限がありません。" };
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("report3_entries")
    .select("id, tenant_id, approved_at")
    .eq("id", entryId)
    .single();

  if (fetchError || !existing) {
    return { ok: false, error: "対象の日報が見つかりません。" };
  }

  if (existing.tenant_id !== session.tenantId) {
    return { ok: false, error: "他テナントの日報は承認できません。" };
  }

  if (existing.approved_at) {
    // 既に承認済み — 冪等に成功扱い
    return { ok: true };
  }

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("report3_entries")
    .update({
      approved_at: now,
      approved_by: session.userId,
    })
    .eq("id", entryId);

  if (updateError) {
    return { ok: false, error: "承認の保存に失敗しました。" };
  }

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "report3.approved",
    target_type: "report3_entry",
    target_id: entryId,
    diff: { approved_at: now },
  });

  revalidatePath("/pc/home");
  revalidatePath("/pc/approvals");
  revalidatePath("/sp/approvals");
  revalidatePath(`/sp/report3/${entryId}`);

  return { ok: true };
}
