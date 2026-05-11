import Link from "next/link";
import { Award, ShieldCheck, Star } from "lucide-react";

const BADGES = [
  {
    id: "input-master",
    name: "入力マスター",
    note: "REPORT3を連続7日入力",
    date: "昨日",
    icon: Star,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    id: "cost-king",
    name: "原価番長",
    note: "原価入力を10件達成",
    date: "05/27",
    icon: Award,
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    id: "safety-leader",
    name: "安全リーダー",
    note: "ヒヤリハット報告3件達成",
    date: "05/26",
    icon: ShieldCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

export function QuestBadgeSummary({
  level = 18,
  currentXp = 7850,
  nextLevelXp = 10000,
  questLabel = "安全第一チャレンジ",
  questDescription = "今月中にヒヤリハット報告を20件集めよう",
  questProgress = 14,
  questGoal = 20,
  questDeadline = "2025/06/30",
}: {
  level?: number;
  currentXp?: number;
  nextLevelXp?: number;
  questLabel?: string;
  questDescription?: string;
  questProgress?: number;
  questGoal?: number;
  questDeadline?: string;
}) {
  const xpPct = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));
  const xpRemaining = Math.max(0, nextLevelXp - currentXp);
  const questPct = Math.min(100, Math.round((questProgress / questGoal) * 100));

  return (
    <div
      className="dashboard-quest-summary relative flex h-full flex-col gap-1 overflow-hidden rounded-md"
      style={{
        backgroundImage:
          "radial-gradient(circle at 6% 8%, rgba(244,63,94,.18) 0 2px, transparent 3px), radial-gradient(circle at 25% 18%, rgba(59,130,246,.14) 0 2px, transparent 3px), radial-gradient(circle at 44% 4%, rgba(250,204,21,.22) 0 2px, transparent 3px), radial-gradient(circle at 68% 12%, rgba(16,185,129,.14) 0 2px, transparent 3px), radial-gradient(circle at 91% 7%, rgba(168,85,247,.12) 0 2px, transparent 3px)",
      }}
    >
      {/* 上段: あなたの XP + チームクエスト */}
      <div className="grid flex-1 grid-cols-2 gap-1">
        {/* あなたの XP */}
        <div className="dashboard-quest-card flex flex-col rounded-md bg-white p-2 shadow-sm">
          <div className="text-[10px] font-bold text-slate-700">あなたのXP</div>
          <div className="mt-0.5 text-[11px] font-bold text-slate-800">Lv. {level}</div>
          <div className="mt-0.5 text-[17px] font-black leading-none text-slate-950">
            {currentXp.toLocaleString("ja-JP")}
            <span className="ml-0.5 text-[9px] font-medium text-slate-500">
              /{nextLevelXp.toLocaleString("ja-JP")} XP
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-rose-100">
            <div className="h-full rounded-full bg-rose-500" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="mt-auto pt-1 text-[9px] leading-tight text-slate-500">
            次のレベルまで {xpRemaining.toLocaleString("ja-JP")} XP
          </div>
        </div>

        {/* チームクエスト */}
        <div className="dashboard-quest-card flex flex-col rounded-md bg-white p-2 shadow-sm">
          <div className="text-[10px] font-bold leading-tight text-slate-700">
            チームクエスト進捗
          </div>
          <div className="mt-0.5 truncate text-[11px] font-black text-slate-950">
            {questLabel}
          </div>
          <p className="mt-0.5 line-clamp-2 text-[9px] leading-tight text-slate-500">
            {questDescription}
          </p>
          <div className="mt-0.5 text-[15px] font-black leading-none text-slate-950">
            {questProgress}
            <span className="ml-0.5 text-[9px] font-medium text-slate-500">/{questGoal}件</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-rose-100">
            <div className="h-full rounded-full bg-rose-500" style={{ width: `${questPct}%` }} />
          </div>
          <div className="mt-auto pt-1 text-[9px] leading-tight text-slate-500">
            期限:{questDeadline}
          </div>
        </div>
      </div>

      {/* 下段: 最近獲得したバッジ(panel 全幅) */}
      <div className="dashboard-quest-card flex flex-1 flex-col rounded-md bg-white p-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold leading-tight text-slate-700">
            最近獲得したバッジ
          </div>
          <Link
            href="/pc/quests-badges"
            className="text-[9px] font-bold text-blue-700 hover:underline"
          >
            すべて見る ›
          </Link>
        </div>
        <ul className="mt-1 flex-1 divide-y divide-slate-100">
          {BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <li key={b.id} className="flex items-center gap-1.5 py-0.5">
                <div
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${b.bg}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${b.color}`} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10px] font-bold leading-tight text-slate-900">
                    {b.name}
                  </div>
                  <div className="truncate text-[9px] leading-tight text-slate-500">
                    {b.note}
                  </div>
                </div>
                <span className="flex-shrink-0 whitespace-nowrap text-[9px] text-slate-400">
                  {b.date}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
