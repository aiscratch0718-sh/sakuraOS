"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export type PointActionResult =
  | { ok: true; ledgerId?: string }
  | { ok: false; error: string };

/**
 * ポイント付与(管理者向け手動 / 自動バッチ から呼び出す)。
 *
 * - earn / bonus / adjust / refund を含む
 * - 残高は award_points 関数(security definer)で原子的に更新
 */
const awardSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().refine((n) => n !== 0, "0 は不可"),
  type: z.enum(["earn", "bonus", "adjust", "refund"]),
  reason: z.string().min(1).max(500),
  category: z.string().min(1).max(50).optional(),
  sourceTable: z.string().optional(),
  sourceId: z.string().uuid().optional(),
});

export async function awardPoints(
  input: z.infer<typeof awardSchema>,
): Promise<PointActionResult> {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    return { ok: false, error: "管理者のみ操作できます" };
  }
  const parsed = awardSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力エラー" };
  }
  const sb = await createClient();
  const { data, error } = await sb.rpc("award_points", {
    p_user_id: parsed.data.userId,
    p_amount: parsed.data.amount,
    p_type: parsed.data.type,
    p_reason: parsed.data.reason,
    p_category: parsed.data.category ?? null,
    p_source_table: parsed.data.sourceTable ?? null,
    p_source_id: parsed.data.sourceId ?? null,
    p_approved_by: session.userId,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath("/pc/points");
  return { ok: true, ledgerId: data as string };
}

/**
 * 報酬交換を申請する(本人操作)。
 * 残高チェックして pending で作成。実消費は承認時。
 */
export async function requestExchange(
  rewardId: string,
): Promise<PointActionResult> {
  const session = await requireSession();
  const sb = await createClient();

  const { data: reward, error: rewardErr } = await sb
    .from("rewards")
    .select("id, cost_points, is_active, name")
    .eq("id", rewardId)
    .maybeSingle();

  if (rewardErr || !reward || !reward.is_active) {
    return { ok: false, error: "報酬が見つからないか無効です" };
  }

  const { data: bal } = await sb
    .from("points_balances")
    .select("balance")
    .eq("user_id", session.userId)
    .maybeSingle();

  const balance = bal?.balance ?? 0;
  if (balance < reward.cost_points) {
    return {
      ok: false,
      error: `ポイント残高が不足しています(残 ${balance}pt / 必要 ${reward.cost_points}pt)`,
    };
  }

  const { error } = await sb.from("exchange_requests").insert({
    tenant_id: session.tenantId,
    user_id: session.userId,
    reward_id: rewardId,
    cost_points: reward.cost_points,
    status: "pending",
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath("/pc/points");
  revalidatePath("/sp/points");
  return { ok: true };
}

/**
 * 報酬交換を承認(office+ のみ)。
 * award_points で spend を実行 + status 更新を 1 トランザクションで。
 */
export async function approveExchange(
  requestId: string,
): Promise<PointActionResult> {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    return { ok: false, error: "管理者のみ操作できます" };
  }
  const sb = await createClient();

  const { data: req, error: fetchErr } = await sb
    .from("exchange_requests")
    .select("id, user_id, reward_id, cost_points, status, reward:rewards(name)")
    .eq("id", requestId)
    .maybeSingle();

  if (fetchErr || !req) {
    return { ok: false, error: "申請が見つかりません" };
  }
  if (req.status !== "pending") {
    return { ok: false, error: "この申請は既に処理済みです" };
  }

  const rewardName =
    (Array.isArray(req.reward)
      ? req.reward[0]?.name
      : (req.reward as { name?: string } | null)?.name) ?? "報酬";

  // spend を ledger に追加(残高もここで更新される)
  const { data: ledgerId, error: spendErr } = await sb.rpc("award_points", {
    p_user_id: req.user_id,
    p_amount: -req.cost_points,
    p_type: "spend",
    p_reason: `報酬交換: ${rewardName}`,
    p_category: "交換",
    p_source_table: "exchange_requests",
    p_source_id: req.id,
    p_approved_by: session.userId,
  });

  if (spendErr) {
    return { ok: false, error: spendErr.message };
  }

  const { error: updateErr } = await sb
    .from("exchange_requests")
    .update({
      status: "approved",
      approved_by: session.userId,
      approved_at: new Date().toISOString(),
      ledger_id: ledgerId as string,
    })
    .eq("id", requestId);

  if (updateErr) {
    return { ok: false, error: updateErr.message };
  }

  // 報酬の交換数も加算
  await sb
    .from("rewards")
    .update({ total_redeemed: 1 })
    .eq("id", req.reward_id);

  revalidatePath("/pc/points");
  revalidatePath("/pc/points/exchange-requests");
  return { ok: true };
}

/**
 * 報酬交換を却下(office+ のみ)。残高は減らさない。
 */
const rejectSchema = z.object({
  requestId: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

export async function rejectExchange(
  input: z.infer<typeof rejectSchema>,
): Promise<PointActionResult> {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    return { ok: false, error: "管理者のみ操作できます" };
  }
  const parsed = rejectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力エラー" };
  }
  const sb = await createClient();
  const { error } = await sb
    .from("exchange_requests")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
      rejection_reason: parsed.data.reason,
      approved_by: session.userId,
    })
    .eq("id", parsed.data.requestId)
    .eq("status", "pending");
  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath("/pc/points/exchange-requests");
  return { ok: true };
}

/**
 * 履行完了マーキング(報酬を実際に渡したあと)。
 */
export async function markFulfilled(
  requestId: string,
): Promise<PointActionResult> {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    return { ok: false, error: "管理者のみ操作できます" };
  }
  const sb = await createClient();
  const { error } = await sb
    .from("exchange_requests")
    .update({
      status: "fulfilled",
      fulfilled_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("status", "approved");
  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath("/pc/points/exchange-requests");
  return { ok: true };
}

/**
 * ゲーミフィケーション opt-out 切替(本人操作)。
 */
export async function toggleGamificationOptOut(
  optOut: boolean,
): Promise<PointActionResult> {
  const session = await requireSession();
  const sb = await createClient();
  const { error } = await sb
    .from("profiles")
    .update({ gamification_opt_out: optOut })
    .eq("id", session.userId);
  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath("/pc/profile");
  return { ok: true };
}
