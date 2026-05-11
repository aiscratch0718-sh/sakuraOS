import Link from "next/link";
import { Award, ShieldCheck, Star } from "lucide-react";

const BADGES = [
  { id: "input-master", name: "入力マスター", note: "REPORT3を連続入力", icon: Star, color: "text-orange-500" },
  { id: "cost-king", name: "原価番長", note: "原価入力を10件達成", icon: Award, color: "text-violet-500" },
  { id: "safety-leader", name: "安全リーダー", note: "安全チェック3件達成", icon: ShieldCheck, color: "text-emerald-600" },
];

export function QuestBadgeSummary({
  level = 18,
  currentXp = 7850,
  nextLevelXp = 10000,
  questLabel = "安全第一チャレンジ",
  questProgress = 14,
  questGoal = 20,
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
    <div
      className="dashboard-quest-summary relative grid h-full grid-cols-3 gap-1 overflow-hidden rounded-md"
      style={{
        backgroundImage:
          "radial-gradient(circle at 6% 8%, rgba(244,63,94,.20) 0 2px, transparent 3px), radial-gradient(circle at 25% 18%, rgba(59,130,246,.15) 0 2px, transparent 3px), radial-gradient(circle at 44% 4%, rgba(250,204,21,.25) 0 2px, transparent 3px), radial-gradient(circle at 68% 12%, rgba(16,185,129,.16) 0 2px, transparent 3px), radial-gradient(circle at 91% 7%, rgba(168,85,247,.14) 0 2px, transparent 3px)",
      }}
    >
      {/* あなたの XP */}
      <div className="dashboard-quest-card flex flex-col rounded-md bg-white p-1.5 shadow-sm">
        <div className="text-[10px] font-bold text-slate-700">あなたのXP</div>
        <div className="mt-0.5 text-[10px] text-slate-700">Lv. {level}</div>
        <div className="mt-0.5 text-[16px] font-black leading-none text-slate-950">
          {currentXp.toLocaleString("ja-JP")}
          <span className="ml-0.5 text-[9px] font-medium text-slate-500">/{nextLevelXp.toLocaleString("ja-JP")}</span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-rose-100">
          <div className="h-full rounded-full bg-rose-500" style={{ width: `${xpPct}%` }} />
        </div>
        <div className="mt-0.5 text-[9px] leading-tight text-slate-500">
          次まで {xpRemaining.toLocaleString("ja-JP")} XP
        </div>
      </div>

      {/* チームクエスト */}
      <div className="dashboard-quest-card flex flex-col rounded-md bg-white p-1.5 shadow-sm">
        <div className="text-[10px] font-bold leading-tight text-slate-700">チームクエスト</div>
        <div className="mt-0.5 truncate text-[10px] font-black text-slate-950">{questLabel}</div>
        <div className="mt-0.5 text-[16px] font-black leading-none text-slate-950">
          {questProgress}
          <span className="ml-0.5 text-[9px] font-medium text-slate-500">/{questGoal}件</span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-rose-100">
          <div className="h-full rounded-full bg-rose-500" style={{ width: `${questPct}%` }} />
        </div>
        <div className="mt-0.5 truncate text-[9px] leading-tight text-slate-500">
          ヒヤリハット報告
        </div>
      </div>

      {/* 最近獲得したバッジ */}
      <div className="dashboard-quest-card flex flex-col rounded-md bg-white p-1.5 shadow-sm">
        <div className="text-[10px] font-bold leading-tight text-slate-700">最近のバッジ</div>
        <div className="mt-0.5 flex flex-1 flex-col justify-between gap-0.5">
          {BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.id} className="flex items-center gap-1">
                <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${b.color}`} aria-hidden />
                <div className="min-w-0 truncate text-[10px] font-bold leading-tight text-slate-900">
                  {b.name}
                </div>
              </div>
            );
          })}
        </div>
        <Link href="/pc/quests-badges" className="mt-0.5 block text-right text-[9px] font-bold text-blue-700">
          すべて見る ›
        </Link>
      </div>
    </div>
  );
}
