import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/ui/KpiCard";
import { Tag } from "@/components/ui/Tag";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  getMyBalance,
  getRanking,
  getMonthBreakdown,
  getPointsKpis,
} from "@/features/points/queries";
import { ExchangeRequestForm } from "./_components/ExchangeRequestForm";

export const dynamic = "force-dynamic";

export default async function PointsPage() {
  const session = await requireSession();
  const isAdmin = ["office", "ceo", "system"].includes(session.role);

  const sb = await createClient();
  const [
    myBalance,
    ranking,
    breakdown,
    kpis,
    { data: rewards },
  ] = await Promise.all([
    getMyBalance(session.userId),
    getRanking("month", 5),
    getMonthBreakdown(session.userId),
    isAdmin
      ? getPointsKpis()
      : Promise.resolve(null),
    sb
      .from("rewards")
      .select("id, name, icon, cost_points, description, is_rare, total_redeemed")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
  ]);

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-5 flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-navy flex items-center gap-2">
            <span aria-hidden>💎</span>ポイント管理
          </h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            実業務での頑張り(出来高・安全・期限遵守 等)が蓄積されます
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link href="/pc/points/rules" className="btn-ghost py-2 px-3 text-[12px]">
              ⚙️ 獲得ルール
            </Link>
            <Link
              href="/pc/points/exchange-requests"
              className="btn-primary py-2 px-3 text-[12px]"
            >
              📬 交換申請を承認
            </Link>
          </div>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiCard
          icon="💰"
          accent="p4"
          label="あなたの残高"
          value={myBalance.balance.toLocaleString("ja-JP")}
          unit="pt"
          subText={`累計獲得 ${myBalance.totalEarned.toLocaleString("ja-JP")}pt`}
        />
        {isAdmin && kpis ? (
          <>
            <KpiCard
              icon="🏢"
              accent="p3"
              label="全社合計ポイント"
              value={kpis.totalAllUsers.toLocaleString("ja-JP")}
              unit="pt"
            />
            <KpiCard
              icon="📈"
              accent="p2"
              label="今月の獲得"
              value={kpis.monthEarnedTotal.toLocaleString("ja-JP")}
              unit="pt"
            />
            <KpiCard
              icon="📬"
              accent={kpis.pendingExchangeCount > 0 ? "p1" : "blue"}
              label="交換申請(未処理)"
              value={kpis.pendingExchangeCount}
              unit="件"
              subText={`合計 ${kpis.pendingExchangePoints.toLocaleString("ja-JP")}pt`}
            />
          </>
        ) : (
          <>
            <KpiCard
              icon="📈"
              accent="p3"
              label="今月の獲得"
              value={breakdown.reduce((s, b) => s + b.amount, 0).toLocaleString("ja-JP")}
              unit="pt"
            />
            <KpiCard
              icon="🎁"
              accent="p2"
              label="累計交換"
              value={myBalance.totalSpent.toLocaleString("ja-JP")}
              unit="pt"
            />
            <KpiCard
              icon="⏱"
              accent="blue"
              label="次の報酬まで"
              value={
                rewards && rewards.length > 0
                  ? Math.max(0, (rewards[0]?.cost_points ?? 0) - myBalance.balance)
                  : 0
              }
              unit="pt"
              subText={
                rewards && rewards.length > 0
                  ? `${rewards[0]?.icon ?? ""} ${rewards[0]?.name}`
                  : undefined
              }
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 今月のランキング */}
        <section className="bg-panel border border-line rounded-panel overflow-hidden">
          <header className="px-4 py-3 border-b border-line flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
              <span aria-hidden>🏆</span>今月のランキング
            </h2>
            <span className="text-[10px] text-ink-3">
              opt-out 表示は自動的に匿名化
            </span>
          </header>
          <div className="p-2">
            {ranking.length === 0 ? (
              <p className="py-8 text-center text-[12px] text-ink-3">
                今月はまだポイント獲得記録がありません
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {ranking.map((r) => {
                  const rankIcon =
                    r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : null;
                  return (
                    <li
                      key={r.userId}
                      className="flex items-center gap-3 px-3 py-2.5"
                    >
                      <div className="w-8 text-center font-extrabold text-[14px]">
                        {rankIcon ?? <span className="text-ink-3">{r.rank}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-ink truncate">
                          {r.displayName}
                        </div>
                      </div>
                      <div className="text-[14px] font-extrabold text-p4">
                        {r.monthEarned.toLocaleString("ja-JP")}
                        <span className="text-[10px] text-ink-3 font-normal ml-0.5">
                          pt
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* 今月の獲得内訳 */}
        <section className="bg-panel border border-line rounded-panel overflow-hidden">
          <header className="px-4 py-3 border-b border-line">
            <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
              <span aria-hidden>📋</span>あなたの今月の獲得内訳
            </h2>
          </header>
          <div className="p-4">
            {breakdown.length === 0 ? (
              <p className="py-8 text-center text-[12px] text-ink-3">
                今月はまだポイント獲得記録がありません
              </p>
            ) : (
              <div className="space-y-3">
                {breakdown.map((b) => {
                  const max = Math.max(...breakdown.map((x) => x.amount), 1);
                  return (
                    <div key={b.category}>
                      <div className="flex items-center justify-between text-[12px] mb-1">
                        <span className="font-bold text-ink">
                          {b.category}{" "}
                          <span className="text-[10px] font-normal text-ink-3">
                            ({b.count}回)
                          </span>
                        </span>
                        <span className="font-extrabold text-p4">
                          +{b.amount.toLocaleString("ja-JP")}pt
                        </span>
                      </div>
                      <ProgressBar value={b.amount} max={max} color="p4" size="sm" />
                    </div>
                  );
                })}
                <div className="pt-3 mt-3 border-t border-line flex items-center justify-between">
                  <span className="text-[12px] font-bold text-ink-2">今月合計</span>
                  <span className="text-[18px] font-extrabold text-p4">
                    {breakdown
                      .reduce((s, b) => s + b.amount, 0)
                      .toLocaleString("ja-JP")}
                    <span className="text-[10px] text-ink-3 font-normal ml-0.5">
                      pt
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 報酬交換所 */}
      <section className="bg-panel border border-line rounded-panel overflow-hidden mt-4">
        <header className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
            <span aria-hidden>🎁</span>報酬交換所
          </h2>
          <span className="text-[10px] text-ink-3">
            申請後、管理者の承認で確定
          </span>
        </header>
        <div className="p-3">
          {!rewards || rewards.length === 0 ? (
            <p className="py-8 text-center text-[12px] text-ink-3">
              報酬がまだ登録されていません
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rewards.map((r) => {
                const cost = r.cost_points as number;
                const canAfford = myBalance.balance >= cost;
                const lacking = cost - myBalance.balance;
                return (
                  <div
                    key={r.id as string}
                    className={`relative rounded-btn border p-3 ${
                      r.is_rare
                        ? "border-gold bg-gradient-to-br from-[#FFF9E6] to-[#FEF5E4]"
                        : "border-line bg-white"
                    }`}
                  >
                    {r.is_rare && (
                      <Tag variant="gold" size="sm" className="absolute top-2 right-2">
                        🔥 レア
                      </Tag>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="text-[36px] leading-none" aria-hidden>
                        {(r.icon as string) ?? "🎁"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-ink leading-tight">
                          {r.name as string}
                        </div>
                        {r.description && (
                          <div className="text-[10px] text-ink-3 mt-0.5">
                            {r.description as string}
                          </div>
                        )}
                        <div className="text-[10px] text-ink-3 mt-0.5">
                          交換実績 {r.total_redeemed as number}回
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-[16px] font-extrabold text-p4">
                        {cost.toLocaleString("ja-JP")}
                        <span className="text-[10px] text-ink-3 font-normal ml-0.5">
                          pt
                        </span>
                      </span>
                      <ExchangeRequestForm
                        rewardId={r.id as string}
                        rewardName={r.name as string}
                        canAfford={canAfford}
                        lacking={lacking}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <p className="text-[10px] text-ink-3 mt-4 text-center">
        ポイントは安全コンボ・出来高・日報提出など、実業務での貢献に対して付与されます。
        交換は任意で、ランキング表示が嫌な場合は{" "}
        <Link href="/pc/profile" className="underline">
          プロフィール
        </Link>
        から非表示にできます。
      </p>
    </div>
  );
}
