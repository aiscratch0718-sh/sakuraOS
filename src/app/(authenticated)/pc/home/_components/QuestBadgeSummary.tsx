import Link from "next/link";

const BADGES = [
  { id: "input-master", name: "入力マスター", color: "bg-blue-50 text-blue-700" },
  { id: "cost-king", name: "原価番長", color: "bg-amber-50 text-amber-700" },
  { id: "safety-leader", name: "安全リーダー", color: "bg-teal-50 text-teal-700" },
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
          <span className="text-[11px] text-gray-500">あなたの XP</span>
          <span className="text-[12px] font-bold text-gray-900">Lv.{level}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={currentXp}
          aria-valuemin={0}
          aria-valuemax={nextLevelXp}
          aria-label={`Lv.${level} の経験値 ${currentXp} / ${nextLevelXp}`}
          className="h-2 rounded-full bg-gray-100 overflow-hidden"
        >
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
            style={{ width: `${xpPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[10px] text-gray-500 tabular-nums">
            {currentXp.toLocaleString("ja-JP")} / {nextLevelXp.toLocaleString("ja-JP")} XP
          </span>
          <span className="text-[10px] text-gray-500 tabular-nums">
            次のレベルまで{" "}
            <span className="font-medium text-gray-700">
              {xpRemaining.toLocaleString("ja-JP")}
            </span>{" "}
            XP
          </span>
        </div>
      </div>

      {/* チームクエスト */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-medium text-gray-800">
            {questLabel}
          </span>
          <span className="text-[11px] text-gray-500">期限 {questDeadline}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={questProgress}
          aria-valuemin={0}
          aria-valuemax={questGoal}
          aria-label={`${questLabel} ${questProgress} / ${questGoal}`}
          className="h-2 rounded-full bg-gray-100 overflow-hidden"
        >
          <div
            className="h-full bg-teal-500 rounded-full"
            style={{ width: `${questPct}%` }}
          />
        </div>
        <div className="text-[11px] text-gray-700 mt-0.5 tabular-nums">
          {questProgress} / {questGoal} 件
        </div>
      </div>

      {/* バッジ */}
      <div>
        <div className="text-[11px] text-gray-500 mb-1.5">
          最近獲得したバッジ
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {BADGES.map((b) => (
            <div
              key={b.id}
              className={`px-2 py-1 rounded-full text-[11px] font-medium ${b.color}`}
              title={b.name}
            >
              {b.name}
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/pc/badges"
        className="block text-right text-[11px] text-gray-500 hover:text-gray-700"
      >
        すべてのバッジを見る →
      </Link>
    </div>
  );
}
