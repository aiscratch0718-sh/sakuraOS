/**
 * ポイント関連のクエリ集(server-only)。
 */
import { createClient } from "@/lib/supabase/server";

export type PointsBalance = {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
};

export type PointsRanking = {
  userId: string;
  displayName: string;
  monthEarned: number;
  totalBalance: number;
  rank: number;
};

export type PointsBreakdown = {
  category: string;
  amount: number;
  count: number;
};

export type LedgerEntry = {
  id: string;
  userId: string;
  userName: string;
  type: string;
  amount: number;
  balanceAfter: number;
  reason: string;
  category: string | null;
  createdAt: string;
};

/**
 * 自分の残高(無ければ 0)
 */
export async function getMyBalance(userId: string): Promise<PointsBalance> {
  const sb = await createClient();
  const { data } = await sb
    .from("points_balances")
    .select("user_id, balance, total_earned, total_spent")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) {
    return {
      userId,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
    };
  }
  return {
    userId: data.user_id,
    balance: data.balance,
    totalEarned: data.total_earned,
    totalSpent: data.total_spent,
  };
}

/**
 * テナント全体のポイントランキング(opt-out ユーザーは除外)。
 *
 * @param period "month" — 当月の付与のみ集計
 *               "all"   — 累計残高
 */
export async function getRanking(
  period: "month" | "all" = "month",
  limit = 10,
): Promise<PointsRanking[]> {
  const sb = await createClient();

  if (period === "all") {
    const { data } = await sb
      .from("points_balances")
      .select(
        "user_id, balance, total_earned, total_spent, profile:profiles!points_balances_user_id_fkey(display_name, gamification_opt_out)",
      )
      .order("total_earned", { ascending: false })
      .limit(limit);

    return (data ?? [])
      .map((row, i) => {
        const profile = (
          Array.isArray(row.profile)
            ? row.profile[0]
            : (row.profile as { display_name?: string; gamification_opt_out?: boolean } | null)
        ) as { display_name?: string; gamification_opt_out?: boolean } | null;
        return {
          userId: row.user_id as string,
          displayName: profile?.gamification_opt_out
            ? `匿名${i + 1}`
            : profile?.display_name ?? "—",
          monthEarned: 0,
          totalBalance: row.balance as number,
          rank: i + 1,
        };
      })
      .filter((_, i) => i < limit);
  }

  // month: ledger を当月で集計
  const monthStart = startOfMonthJP();
  const { data: ledgerRows } = await sb
    .from("points_ledger")
    .select("user_id, amount, type, created_at")
    .gte("created_at", monthStart)
    .in("type", ["earn", "bonus"]);

  const sumByUser = new Map<string, number>();
  for (const row of ledgerRows ?? []) {
    const uid = row.user_id as string;
    const amt = row.amount as number;
    sumByUser.set(uid, (sumByUser.get(uid) ?? 0) + amt);
  }

  if (sumByUser.size === 0) return [];

  const { data: profiles } = await sb
    .from("profiles")
    .select("id, display_name, gamification_opt_out")
    .in("id", Array.from(sumByUser.keys()));

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id as string, p]),
  );

  const sorted = Array.from(sumByUser.entries())
    .map(([userId, monthEarned]) => {
      const p = profileMap.get(userId);
      return {
        userId,
        displayName: p?.gamification_opt_out
          ? "匿名"
          : (p?.display_name as string | undefined) ?? "—",
        monthEarned,
        totalBalance: 0,
        rank: 0,
      };
    })
    .sort((a, b) => b.monthEarned - a.monthEarned)
    .slice(0, limit)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return sorted;
}

/**
 * 当月の獲得内訳(カテゴリ別)
 */
export async function getMonthBreakdown(
  userId: string,
): Promise<PointsBreakdown[]> {
  const sb = await createClient();
  const monthStart = startOfMonthJP();
  const { data } = await sb
    .from("points_ledger")
    .select("amount, category, type")
    .eq("user_id", userId)
    .gte("created_at", monthStart)
    .in("type", ["earn", "bonus"]);

  const byCategory = new Map<string, { amount: number; count: number }>();
  for (const row of data ?? []) {
    const cat = (row.category as string | null) ?? "その他";
    const amt = row.amount as number;
    const cur = byCategory.get(cat) ?? { amount: 0, count: 0 };
    cur.amount += amt;
    cur.count += 1;
    byCategory.set(cat, cur);
  }

  return Array.from(byCategory.entries())
    .map(([category, { amount, count }]) => ({ category, amount, count }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * テナント KPI(管理者ダッシュボード用)
 */
export async function getPointsKpis(): Promise<{
  totalAllUsers: number;
  monthEarnedTotal: number;
  pendingExchangeCount: number;
  pendingExchangePoints: number;
  monthRedeemedTotal: number;
}> {
  const sb = await createClient();
  const monthStart = startOfMonthJP();

  const [
    { data: balances },
    { data: monthLedger },
    { data: pendingExchanges },
    { data: monthRedeemed },
  ] = await Promise.all([
    sb.from("points_balances").select("balance"),
    sb
      .from("points_ledger")
      .select("amount, type")
      .gte("created_at", monthStart)
      .in("type", ["earn", "bonus"]),
    sb
      .from("exchange_requests")
      .select("cost_points")
      .eq("status", "pending"),
    sb
      .from("exchange_requests")
      .select("cost_points")
      .in("status", ["approved", "fulfilled"])
      .gte("approved_at", monthStart),
  ]);

  const totalAllUsers = (balances ?? []).reduce(
    (s, b) => s + (b.balance as number),
    0,
  );
  const monthEarnedTotal = (monthLedger ?? []).reduce(
    (s, l) => s + (l.amount as number),
    0,
  );
  const pendingExchangeCount = (pendingExchanges ?? []).length;
  const pendingExchangePoints = (pendingExchanges ?? []).reduce(
    (s, e) => s + (e.cost_points as number),
    0,
  );
  const monthRedeemedTotal = (monthRedeemed ?? []).reduce(
    (s, e) => s + (e.cost_points as number),
    0,
  );

  return {
    totalAllUsers,
    monthEarnedTotal,
    pendingExchangeCount,
    pendingExchangePoints,
    monthRedeemedTotal,
  };
}

/**
 * 取引履歴(管理者用、最新N件)
 */
export async function getRecentLedger(limit = 50): Promise<LedgerEntry[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("points_ledger")
    .select(
      "id, user_id, type, amount, balance_after, reason, category, created_at, user:profiles!points_ledger_user_id_fkey(display_name)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => {
    const userObj = Array.isArray(row.user)
      ? row.user[0]
      : (row.user as { display_name?: string } | null);
    return {
      id: row.id as string,
      userId: row.user_id as string,
      userName: userObj?.display_name ?? "—",
      type: row.type as string,
      amount: row.amount as number,
      balanceAfter: row.balance_after as number,
      reason: row.reason as string,
      category: row.category as string | null,
      createdAt: row.created_at as string,
    };
  });
}

function startOfMonthJP(): string {
  const tokyo = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  const y = tokyo.getFullYear();
  const m = String(tokyo.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}
