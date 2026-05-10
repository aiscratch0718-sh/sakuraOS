"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { awardPoints } from "@/features/points/actions";

export type TitleActionResult =
  | { ok: true; titleGrantedId?: string }
  | { ok: false; error: string };

const grantSchema = z.object({
  userId: z.string().uuid(),
  titleId: z.string().uuid(),
  reason: z.string().min(10).max(500),
});

/**
 * 称号を社員に付与する(管理者のみ)。
 *
 * - titles_granted に INSERT(UNIQUE 制約により重複付与は失敗)
 * - 称号定義の reward_points が 0 より大なら同時にポイント付与
 *
 * クライアント確認(P3-B-07)で表示する獲得演出は、被付与者がログイン時に
 * 自動的に発火する仕組みを用意する(localStorage で既読管理)。
 */
export async function grantTitle(
  input: z.infer<typeof grantSchema>,
): Promise<TitleActionResult> {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    return { ok: false, error: "管理者のみ操作できます" };
  }

  const parsed = grantSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "入力エラー",
    };
  }

  const sb = await createClient();

  // 称号定義を取得(reward_points を確認)
  const { data: title, error: titleErr } = await sb
    .from("title_definitions")
    .select("id, display_name, reward_points, is_active")
    .eq("id", parsed.data.titleId)
    .maybeSingle();

  if (titleErr || !title) {
    return { ok: false, error: "称号が見つかりません" };
  }
  if (!title.is_active) {
    return { ok: false, error: "停止中の称号は付与できません" };
  }

  // 重複チェック(UNIQUE 制約だけだとエラーメッセージが分かりにくいので先に確認)
  const { data: existing } = await sb
    .from("titles_granted")
    .select("id")
    .eq("user_id", parsed.data.userId)
    .eq("title_id", parsed.data.titleId)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: "このユーザーには既に同じ称号が付与されています" };
  }

  // 付与
  const { data: granted, error: grantErr } = await sb
    .from("titles_granted")
    .insert({
      tenant_id: session.tenantId,
      user_id: parsed.data.userId,
      title_id: parsed.data.titleId,
      granted_by: session.userId,
      reason: parsed.data.reason,
    })
    .select("id")
    .single();

  if (grantErr || !granted) {
    return { ok: false, error: grantErr?.message ?? "付与に失敗しました" };
  }

  // reward_points が設定されていたらポイント付与
  if (title.reward_points && title.reward_points > 0) {
    await awardPoints({
      userId: parsed.data.userId,
      amount: title.reward_points,
      type: "bonus",
      reason: `称号「${title.display_name}」獲得ボーナス`,
      category: "称号",
      sourceTable: "titles_granted",
      sourceId: granted.id,
    });
  }

  revalidatePath("/pc/profile/status");
  revalidatePath("/pc/users");
  revalidatePath(`/pc/users/${parsed.data.userId}`);
  return { ok: true, titleGrantedId: granted.id };
}

/**
 * 称号を剥奪する(管理者のみ、誤付与時の救済措置)。
 * reward_points は返金しない(運用判断)。
 */
export async function revokeTitle(
  titleGrantedId: string,
): Promise<TitleActionResult> {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    return { ok: false, error: "管理者のみ操作できます" };
  }

  const sb = await createClient();
  const { error } = await sb
    .from("titles_granted")
    .delete()
    .eq("id", titleGrantedId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/pc/profile/status");
  revalidatePath("/pc/users");
  return { ok: true };
}

/**
 * 特殊能力を社員に付与(管理者のみ)。
 */
const grantAbilitySchema = z.object({
  userId: z.string().uuid(),
  abilityId: z.string().uuid(),
});

export async function grantAbility(
  input: z.infer<typeof grantAbilitySchema>,
): Promise<TitleActionResult> {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    return { ok: false, error: "管理者のみ操作できます" };
  }
  const parsed = grantAbilitySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力エラー" };
  }
  const sb = await createClient();
  const { error } = await sb.from("user_abilities").insert({
    user_id: parsed.data.userId,
    ability_id: parsed.data.abilityId,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath("/pc/profile/status");
  return { ok: true };
}
