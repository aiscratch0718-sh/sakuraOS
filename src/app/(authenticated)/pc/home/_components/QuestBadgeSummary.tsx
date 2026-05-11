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
    <div className="grid h-full grid-cols-3 gap-3">
      <div className="rounded-md bg-white p-4 shadow-sm">
        <div className="text-[12px] font-bold text-slate-700">あなたのXP</div>
        <div className="mt-5 text-[13px] font-bold text-slate-800">Lv. {level}</div>
        <div className="mt-2 text-[24px] font-black text-slate-950">
          {currentXp.toLocaleString("ja-JP")}
          <span className="text-[11px] font-medium text-slate-500"> / {nextLevelXp.toLocaleString("ja-JP")} XP</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-rose-100">
          <div className="h-full rounded-full bg-rose-500" style={{ width: `${xpPct}%` }} />
        </div>
        <div className="mt-6 text-[11px] text-slate-600">
          次のレベルまで {xpRemaining.toLocaleString("ja-JP")} XP
        </div>
      </div>

      <div className="rounded-md bg-white p-4 shadow-sm">
        <div className="text-[12px] font-bold text-slate-700">チームクエスト進捗</div>
        <div className="mt-5 text-[15px] font-black text-slate-950">{questLabel}</div>
        <p className="mt-1 text-[11px] text-slate-500">今月中にヒヤリハット報告を20件集めよう</p>
        <div className="mt-3 text-[22px] font-black text-slate-950">
          {questProgress}
          <span className="text-[12px] font-medium text-slate-500"> / {questGoal}件</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-rose-100">
          <div className="h-full rounded-full bg-rose-500" style={{ width: `${questPct}%` }} />
        </div>
        <div className="mt-5 text-[11px] text-slate-600">期限：{questDeadline}</div>
      </div>

      <div className="rounded-md bg-white p-4 shadow-sm">
        <div className="text-[12px] font-bold text-slate-700">最近獲得したバッジ</div>
        <div className="mt-3 space-y-3">
          {BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.id} className="flex items-center gap-3">
                <Icon className={`h-7 w-7 ${b.color}`} aria-hidden />
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-bold text-slate-900">{b.name}</div>
                  <div className="truncate text-[10px] text-slate-500">{b.note}</div>
                </div>
              </div>
            );
          })}
        </div>
        <Link href="/pc/quests-badges" className="mt-4 block text-right text-[12px] font-bold text-blue-700">
          すべてのバッジを見る ›
        </Link>
      </div>
    </div>
  );
}
