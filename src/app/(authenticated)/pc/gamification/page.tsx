import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { rankFor } from "@/features/gamification/rank";

export const dynamic = "force-dynamic";

export default async function PcGamificationPage() {
  const session = await requireSession();
  if (!["leader", "office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }

  const supabase = await createClient();

  // 全プロフィール + 累計 XP + バッジ数 を集計
  const [
    { data: profiles },
    { data: xpEvents },
    { data: badgeCounts },
    { data: badges },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, role")
      .order("display_name", { ascending: true }),
    supabase
      .from("gamification_events")
      .select("user_id, xp_delta"),
    supabase
      .from("user_badges")
      .select("user_id, badge_id"),
    supabase
      .from("badges")
      .select("id, badge_key, display_name, description, icon, rarity, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  const xpMap = new Map<string, number>();
  for (const e of xpEvents ?? []) {
    xpMap.set(e.user_id, (xpMap.get(e.user_id) ?? 0) + Number(e.xp_delta));
  }
  const badgeMap = new Map<string, number>();
  for (const b of badgeCounts ?? []) {
    badgeMap.set(b.user_id, (badgeMap.get(b.user_id) ?? 0) + 1);
  }

  // ランキング(XP 降順)
  const ranking = (profiles ?? [])
    .filter((p) => p.role !== "system")
    .map((p) => {
      const xp = xpMap.get(p.id) ?? 0;
      return {
        ...p,
        xp,
        badges: badgeMap.get(p.id) ?? 0,
        rank: rankFor(xp),
      };
    })
    .sort((a, b) => b.xp - a.xp);

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-navy">ランキング & バッジ</h1>
        <p className="text-[12px] text-ink-2 mt-0.5">
          REPORT3 提出 + 承認 + 連続提出などで XP とバッジが自動付与されます。
        </p>
      </div>

      {/* ランキング表 */}
      <section className="panel-pad mb-5">
        <h2 className="panel-title">
          <span aria-hidden>🏆</span>
          <span>全社ランキング</span>
        </h2>

        {ranking.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-4 text-center">
            まだランキングデータがありません。
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold w-10">順位</th>
                  <th className="py-2 px-3 font-bold w-12">ランク</th>
                  <th className="py-2 px-3 font-bold">作業員</th>
                  <th className="py-2 px-3 font-bold w-20">ロール</th>
                  <th className="py-2 px-3 font-bold text-right w-20">XP</th>
                  <th className="py-2 px-3 font-bold text-right w-16">バッジ</th>
                  <th className="py-2 px-3 font-bold w-32">次ランクまで</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-b border-line hover:bg-blue-bg/30"
                  >
                    <td className="py-2 px-3 font-mono font-bold text-[14px]">
                      {i + 1}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full font-extrabold text-white text-[14px] tracking-wider"
                        style={{ background: p.rank.color }}
                      >
                        {p.rank.rank}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold">{p.display_name}</td>
                    <td className="py-2 px-3 text-[11px] text-ink-2">
                      {p.role}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      {p.xp.toLocaleString("ja-JP")}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      🎖️ {p.badges}
                    </td>
                    <td className="py-2 px-3 text-[11px] text-ink-3">
                      {p.rank.toNext != null
                        ? `${p.rank.nextRank} まで ${p.rank.toNext.toLocaleString("ja-JP")}`
                        : "最高ランク"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* バッジ一覧 */}
      <section className="panel-pad">
        <h2 className="panel-title">
          <span aria-hidden>🎖️</span>
          <span>バッジ一覧({badges?.length ?? 0} 種類)</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
          {(badges ?? []).map((b) => (
            <div
              key={b.id}
              className="border-2 rounded-panel p-3 bg-white"
              style={{ borderColor: rarityColor(b.rarity) }}
            >
              <div className="flex items-start gap-2 mb-1">
                <span className="text-[28px] leading-none" aria-hidden>
                  {b.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[10px] font-bold tracking-widest"
                    style={{ color: rarityColor(b.rarity) }}
                  >
                    {b.rarity.toUpperCase()}
                  </div>
                  <div className="text-[13px] font-extrabold truncate">
                    {b.display_name}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-ink-2 leading-relaxed">
                {b.description ?? ""}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-ink-3 mt-3">
          ※ 自動付与条件: 累計提出件数(1/10/50/100)・連続提出日数(3/7)。クエストは <Link href="/sp/gamification" className="text-blue underline">SP のゲーミフィ画面</Link> で確認できます。
        </p>
      </section>
    </div>
  );
}

function rarityColor(rarity: string): string {
  switch (rarity) {
    case "legendary":
      return "#7040c8";
    case "epic":
      return "#d88000";
    case "rare":
      return "#2568c8";
    default:
      return "#7890a8";
  }
}
