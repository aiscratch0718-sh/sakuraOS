import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { rankFor } from "@/features/gamification/rank";
import { SkillRadar } from "./SkillRadar";
import { XpTimeline } from "./XpTimeline";

export const dynamic = "force-dynamic";

export default async function SpGamificationPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const [
    { data: events },
    { data: career },
    { data: myBadges },
    { data: allBadges },
    { data: quests },
  ] = await Promise.all([
    supabase
      .from("gamification_events")
      .select("xp_delta, event_type, created_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("user_career_totals")
      .select("total_hours, total_reports, last_report_date")
      .eq("user_id", session.userId)
      .maybeSingle(),
    supabase
      .from("user_badges")
      .select("badge_id, awarded_at, badges(badge_key, display_name, description, icon, rarity)")
      .eq("user_id", session.userId)
      .order("awarded_at", { ascending: false }),
    supabase
      .from("badges")
      .select("id, badge_key, display_name, icon, rarity, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("quests")
      .select(
        "id, quest_key, display_name, description, target_count, target_event_type, reward_xp",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  const totalXp = (events ?? []).reduce((s, e) => s + Number(e.xp_delta), 0);
  // 上限の概算には全期間 XP が必要だが、ここでは直近20件しか取得していないので、user_career_totals の総提出件数 × 10 を簡易合計として併記
  const approxTotalXp = (career?.total_reports ?? 0) * 10;
  const usedXp = Math.max(totalXp, approxTotalXp);
  const rank = rankFor(usedXp);

  // クエスト進捗の MVP: 各 target_event_type の発生件数を直近 30 日でカウント
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentEvents } = await supabase
    .from("gamification_events")
    .select("event_type")
    .eq("user_id", session.userId)
    .gte("created_at", since30);
  const eventCount = new Map<string, number>();
  for (const e of recentEvents ?? []) {
    eventCount.set(e.event_type, (eventCount.get(e.event_type) ?? 0) + 1);
  }

  const myBadgeKeys = new Set(
    (myBadges ?? []).map((b) => {
      const badge = b.badges as { badge_key?: string } | null;
      return badge?.badge_key ?? "";
    }),
  );

  // 得意分野マップ用: 自分の report3_rows を l1 で集計
  const { data: skillRows } = await supabase
    .from("report3_rows")
    .select(
      "l1, hours, entry:report3_entries!inner(user_id)",
    )
    .eq("entry.user_id", session.userId);

  const skillMap = new Map<string, number>();
  for (const r of skillRows ?? []) {
    skillMap.set(r.l1, (skillMap.get(r.l1) ?? 0) + Number(r.hours));
  }
  const skillData = Array.from(skillMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // レーダーは6方向まで

  // 直近 14 日の XP タイムライン
  const since14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const sinceIso = since14.toISOString();
  const { data: timelineEvents } = await supabase
    .from("gamification_events")
    .select("xp_delta, created_at")
    .eq("user_id", session.userId)
    .gte("created_at", sinceIso);

  const dailyXp: { date: string; xp: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const ymd = d.toISOString().slice(0, 10);
    dailyXp.push({ date: ymd, xp: 0 });
  }
  for (const e of timelineEvents ?? []) {
    const ymd = e.created_at.slice(0, 10);
    const day = dailyXp.find((d) => d.date === ymd);
    if (day) day.xp += Number(e.xp_delta);
  }

  return (
    <div className="px-4 py-5 max-w-md mx-auto">
      <h1 className="text-lg font-extrabold text-navy mb-3">マイランク</h1>

      {/* ランクカード(パワプロ風) */}
      <div
        className="panel-pad mb-3 border-4"
        style={{
          background: rank.bg,
          borderColor: rank.color,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center font-black text-white text-[40px] tracking-wider shrink-0"
            style={{
              background: rank.color,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {rank.rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black tracking-widest text-ink-2">
              {session.displayName}
            </div>
            <div
              className="text-[28px] font-black leading-none mt-0.5"
              style={{ color: rank.color }}
            >
              {usedXp.toLocaleString("ja-JP")}
              <span className="text-[14px] ml-1 text-ink-3">XP</span>
            </div>
            {rank.toNext != null && (
              <div className="text-[10px] text-ink-2 mt-1 font-bold">
                次ランク {rank.nextRank} まであと{" "}
                <span className="text-navy">
                  {rank.toNext.toLocaleString("ja-JP")} XP
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <Stat label="累計提出" value={career?.total_reports ?? 0} />
          <Stat
            label="累計時間"
            value={`${career ? Number(career.total_hours).toFixed(0) : 0} h`}
          />
          <Stat label="バッジ" value={myBadges?.length ?? 0} />
        </div>
      </div>

      {/* 得意分野マップ */}
      <section className="panel-pad mb-3">
        <h2 className="panel-title">
          <span aria-hidden>🧭</span>
          <span>得意分野マップ</span>
        </h2>
        <SkillRadar data={skillData} />
        {skillData.length > 0 && (
          <p className="text-[10px] text-ink-3 text-center mt-1">
            日報の大分類別 累計時間
          </p>
        )}
      </section>

      {/* 成長グラフ */}
      <section className="panel-pad mb-3">
        <h2 className="panel-title">
          <span aria-hidden>📈</span>
          <span>直近 14 日の XP 獲得</span>
        </h2>
        <XpTimeline series={dailyXp} />
      </section>

      {/* バッジ */}
      <section className="panel-pad mb-3">
        <h2 className="panel-title">
          <span aria-hidden>🎖️</span>
          <span>バッジコレクション</span>
        </h2>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(allBadges ?? []).map((b) => {
            const owned = myBadgeKeys.has(b.badge_key);
            return (
              <div
                key={b.id}
                className={`flex flex-col items-center p-2 rounded-btn ${
                  owned ? "bg-amber-bg/40" : "bg-graybg opacity-40"
                }`}
              >
                <span className="text-[28px]" aria-hidden>
                  {b.icon}
                </span>
                <span className="text-[10px] font-bold text-center mt-1 leading-tight">
                  {b.display_name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* クエスト */}
      <section className="panel-pad mb-3">
        <h2 className="panel-title">
          <span aria-hidden>📜</span>
          <span>クエスト(直近 30 日)</span>
        </h2>
        <ul className="space-y-2">
          {(quests ?? []).map((q) => {
            const progress = eventCount.get(q.target_event_type) ?? 0;
            const ratio = Math.min(1, progress / q.target_count);
            const done = progress >= q.target_count;
            return (
              <li key={q.id} className="text-[12px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">
                    {done && <span className="text-teal mr-1">✓</span>}
                    {q.display_name}
                  </span>
                  <span className="font-mono text-[11px] text-ink-2">
                    {progress} / {q.target_count}
                  </span>
                </div>
                <div className="h-2 bg-graybg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${ratio * 100}%`,
                      background: done ? "#0da870" : "#2568c8",
                    }}
                  />
                </div>
                <div className="text-[10px] text-ink-3 mt-0.5">
                  {q.description}{" "}
                  <span className="text-purple font-bold">+{q.reward_xp} XP</span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 直近 XP イベント */}
      <section className="panel-pad">
        <h2 className="panel-title">
          <span aria-hidden>⚡</span>
          <span>直近の XP 履歴</span>
        </h2>
        {!events || events.length === 0 ? (
          <p className="text-[11px] text-ink-3 py-4 text-center">
            まだ XP 履歴がありません。日報を提出して獲得しましょう。
          </p>
        ) : (
          <ul className="text-[11px] divide-y divide-line">
            {events.map((e, i) => (
              <li
                key={i}
                className="flex items-center justify-between py-1.5"
              >
                <span className="text-ink-2">{eventLabel(e.event_type)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ink-3">
                    {new Date(e.created_at).toLocaleDateString("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                    })}
                  </span>
                  <span
                    className={`font-mono font-bold ${e.xp_delta >= 0 ? "text-teal" : "text-red"}`}
                  >
                    {e.xp_delta >= 0 ? "+" : ""}
                    {e.xp_delta} XP
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white/60 rounded-btn py-2">
      <div className="text-[9px] text-ink-3 font-bold tracking-wider">
        {label}
      </div>
      <div className="text-[14px] font-extrabold leading-none mt-0.5">
        {value}
      </div>
    </div>
  );
}

function eventLabel(type: string): string {
  switch (type) {
    case "report3.submitted":
      return "📝 日報提出";
    case "report3.approved":
      return "✓ 承認獲得";
    case "report3.rejected":
      return "↩ 差戻し";
    default:
      return type;
  }
}
