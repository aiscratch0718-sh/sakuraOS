import Link from "next/link";

const BADGES = [
  { id: "input-master", icon: "📝", name: "入力マスター", color: "bg-blue-bg text-blue" },
  { id: "cost-king", icon: "💴", name: "原価番長", color: "bg-amber-bg text-amber" },
  { id: "safety-leader", icon: "🛡️", name: "安全リーダー", color: "bg-teal-bg text-teal" },
];

/**
 * クエスト・バッジ サマリー(参照画像 下段右)。
 * XP / 次レベルまでの残 XP / クエスト進捗 + 期限を表示。
 * TODO(P12-01-data): user_xp / quests / user_badges から本実装。現状はモック。
 */
export function QuestBadgeSummary({
  level = 18,
  currentXp = 7850,
  nextLevelXp = 10000,
  questLabel = "安全第一チャレンジ",
  questProgress = 14,
  questGoal = 20,
  questDeadline = "2025/06/30",
}: {
  level?: number;
  currentXp?: number;
  nextLevelXp?: number;
  questLabel?: string;
  questProgress?: number;
  questGoal?: number;
  questDeadline?: string;
}) {
  const xpPct = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));
  const xpRemaining = Math.max(0, nextLevelXp - currentXp);
  const questPct = Math.min(100, Math.round((questProgress / questGoal) * 100));

  return (
    <div className="space-y-3">
      {/* 自分の XP */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-ink-3">あなたの XP</span>
          <span className="text-[11px] font-bold text-navy">Lv.{level}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={currentXp}
          aria-valuemin={0}
          aria-valuemax={nextLevelXp}
          aria-label={`Lv.${level} の経験値 ${currentXp} / ${nextLevelXp}`}
          className="h-2 rounded-full bg-graybg overflow-hidden"
        >
          <div
            className="h-full bg-gradient-to-r from-amber to-amber-2"
            style={{ width: `${xpPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[10px] text-ink-3 tabular-nums">
            {currentXp.toLocaleString("ja-JP")} / {nextLevelXp.toLocaleString("ja-JP")} XP
          </span>
          <span className="text-[10px] text-ink-2 tabular-nums">
            次のレベル(Lv.{level + 1})まで{" "}
            <span className="font-bold text-navy">
              {xpRemaining.toLocaleString("ja-JP")}
            </span>{" "}
            XP
          </span>
        </div>
      </div>

      {/* チームクエスト */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-ink">
            🎯 {questLabel}
          </span>
          <span className="text-[10px] text-ink-3">期限 {questDeadline}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={questProgress}
          aria-valuemin={0}
          aria-valuemax={questGoal}
          aria-label={`${questLabel} ${questProgress} / ${questGoal}`}
          className="h-2 rounded-full bg-graybg overflow-hidden"
        >
          <div
            className="h-full bg-teal"
            style={{ width: `${questPct}%` }}
          />
        </div>
        <div className="text-[10px] text-ink-3 mt-0.5 tabular-nums">
          {questProgress} / {questGoal} 件
        </div>
      </div>

      {/* バッジ */}
      <div>
        <div className="text-[11px] text-ink-3 mb-1.5">
          最近獲得したバッジ
        </div>
        <div className="flex items-center gap-2">
          {BADGES.map((b) => (
            <div
              key={b.id}
              className={`flex items-center gap-1 px-2 py-1 rounded-pill text-[10px] font-bold ${b.color}`}
              title={b.name}
            >
              <span aria-hidden>{b.icon}</span>
              <span>{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/pc/badges"
        className="block text-right text-[11px] text-blue hover:underline"
      >
        すべてのバッジを見る →
      </Link>
    </div>
  );
}
