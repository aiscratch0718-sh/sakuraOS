import Link from "next/link";
import { Award, ShieldCheck, Star } from "lucide-react";

const BADGES = [
  { id: "input-master", name: "入力マスター", note: "REPORT3を連続入力", icon: Star, color: "text-orange-500" },
  { id: "cost-king", name: "原価番長", note: "原価入力を10件達成", icon: Award, color: "text-violet-500" },
  { id: "safety-leader", name: "安全リーダー", note: "安全チェック報告3件達成", icon: ShieldCheck, color: "text-emerald-600" },
];

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
    <div
      className="dashboard-quest-summary relative grid h-full grid-cols-3 gap-1.5 overflow-hidden rounded-md p-0.5"
      style={{
        backgroundImage:
          "radial-gradient(circle at 6% 8%, rgba(244,63,94,.28) 0 2px, transparent 3px), radial-gradient(circle at 25% 18%, rgba(59,130,246,.20) 0 2px, transparent 3px), radial-gradient(circle at 44% 4%, rgba(250,204,21,.35) 0 2px, transparent 3px), radial-gradient(circle at 68% 12%, rgba(16,185,129,.22) 0 2px, transparent 3px), radial-gradient(circle at 91% 7%, rgba(168,85,247,.18) 0 2px, transparent 3px)",
      }}
    >
      <div className="dashboard-quest-card rounded-md bg-white p-2 shadow-sm">
        <div className="text-[11px] font-bold text-slate-700">あなたのXP</div>
        <div className="mt-1 text-[12px] font-bold text-slate-800">Lv. {level}</div>
        <div className="mt-1 text-[20px] font-black leading-none text-slate-950">
          {currentXp.toLocaleString("ja-JP")}
          <span className="text-[10px] font-medium text-slate-500"> / {nextLevelXp.toLocaleString("ja-JP")} XP</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-rose-100">
          <div className="h-full rounded-full bg-rose-500" style={{ width: `${xpPct}%` }} />
        </div>
        <div className="mt-1.5 text-[10px] text-slate-600">
          次のレベルまで {xpRemaining.toLocaleString("ja-JP")} XP
        </div>
      </div>

      <div className="dashboard-quest-card rounded-md bg-white p-2 shadow-sm">
        <div className="text-[11px] font-bold text-slate-700">チームクエスト進捗</div>
        <div className="mt-1 text-[12px] font-black text-slate-950">{questLabel}</div>
        <p className="mt-0.5 text-[10px] leading-tight text-slate-500">ヒヤリハット報告 20 件</p>
        <div className="mt-1 text-[18px] font-black leading-none text-slate-950">
          {questProgress}
          <span className="text-[11px] font-medium text-slate-500"> / {questGoal}件</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-rose-100">
          <div className="h-full rounded-full bg-rose-500" style={{ width: `${questPct}%` }} />
        </div>
        <div className="mt-1.5 text-[10px] text-slate-600">期限：{questDeadline}</div>
      </div>

      <div className="dashboard-quest-card rounded-md bg-white p-2 shadow-sm">
        <div className="text-[11px] font-bold text-slate-700">最近獲得したバッジ</div>
        <div className="mt-1 space-y-1">
          {BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.id} className="flex items-center gap-1.5">
                <Icon className={`h-5 w-5 flex-shrink-0 ${b.color}`} aria-hidden />
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-bold leading-tight text-slate-900">{b.name}</div>
                  <div className="truncate text-[9px] leading-tight text-slate-500">{b.note}</div>
                </div>
              </div>
            );
          })}
        </div>
        <Link href="/pc/quests-badges" className="mt-1 block text-right text-[10px] font-bold text-blue-700">
          すべてのバッジを見る ›
        </Link>
      </div>
    </div>
  );
}
