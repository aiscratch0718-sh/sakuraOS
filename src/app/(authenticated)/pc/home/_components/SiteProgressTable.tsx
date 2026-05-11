import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export type SiteProgressRow = {
  id: string;
  name: string;
  workType: string;
  progressPct: number;
  plannedPct: number;
  quality: "good" | "warn";
};

export function SiteProgressTable({ rows }: { rows?: SiteProgressRow[] }) {
  // 配管工事業向けモック(さくら株式会社の業態 = 配管・給排水・給湯設備・改修)
  // TODO(P12-01-data): 本実装まで暫定。projects テーブルから取得に置き換える
  const data: SiteProgressRow[] = rows ?? [
    { id: "p1", name: "駅前ビル給排水改修", workType: "給排水工事", progressPct: 65, plannedPct: 60, quality: "good" },
    { id: "p2", name: "マンション給湯設備工事", workType: "給湯設備工事", progressPct: 42, plannedPct: 45, quality: "warn" },
    { id: "p3", name: "商業施設配管更新", workType: "排水管工事", progressPct: 71, plannedPct: 65, quality: "good" },
    { id: "p4", name: "物流倉庫排水工事", workType: "配管点検工事", progressPct: 28, plannedPct: 30, quality: "good" },
    { id: "p5", name: "マンション改修工事", workType: "改修工事", progressPct: 88, plannedPct: 80, quality: "good" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] text-slate-700">
        <caption className="sr-only">現場別進捗</caption>
        <thead className="text-slate-500">
          <tr className="text-left">
            <th className="px-2 pb-2 font-bold">現場名</th>
            <th className="px-2 pb-2 font-bold">工種</th>
            <th className="min-w-[118px] px-2 pb-2 font-bold">進捗率</th>
            <th className="px-2 pb-2 text-right font-bold">予定進捗</th>
            <th className="px-2 pb-2 text-right font-bold">差異</th>
            <th className="px-2 pb-2 text-center font-bold">安全</th>
            <th className="px-2 pb-2 text-center font-bold">品質</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((r) => {
            const delta = r.progressPct - r.plannedPct;
            return (
              <tr key={r.id} className="transition-colors hover:bg-slate-50">
                <td className="max-w-[170px] px-2 py-1 text-slate-900">
                  <Link href={`/pc/projects/${r.id}`} className="block truncate hover:underline">
                    {r.name}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-2 py-1">{r.workType}</td>
                <td className="px-2 py-1">
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-right font-bold tabular-nums text-slate-800">
                      {r.progressPct}%
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${r.progressPct}%` }} />
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-2 py-1 text-right tabular-nums">{r.plannedPct}%</td>
                {/* 予定より進んでいれば green、遅れていれば red(±0 は中間色) */}
                <td className={`whitespace-nowrap px-2 py-1 text-right font-bold tabular-nums ${delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-600" : "text-slate-500"}`}>
                  {delta > 0 ? `+${delta}%` : delta < 0 ? `${delta}%` : "±0%"}
                </td>
                <td className="px-2 py-1 text-center text-emerald-600">
                  <ShieldCheck className="mx-auto h-4 w-4" aria-hidden />
                </td>
                <td className={`px-2 py-1 text-center ${r.quality === "good" ? "text-emerald-600" : "text-amber-500"}`}>
                  <ShieldCheck className="mx-auto h-4 w-4" aria-hidden />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
