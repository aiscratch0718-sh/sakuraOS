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
    { id: "p1", name: "仙台駅前ビル給排水改修", workType: "給排水工事", progressPct: 65, plannedPct: 60, quality: "good" },
    { id: "p2", name: "泉中央マンション給湯設備", workType: "給湯設備工事", progressPct: 42, plannedPct: 45, quality: "warn" },
    { id: "p3", name: "石巻市商業施設配管更新", workType: "排水管工事", progressPct: 71, plannedPct: 65, quality: "good" },
    { id: "p4", name: "多賀城市物流倉庫排水工事", workType: "配管点検工事", progressPct: 28, plannedPct: 30, quality: "good" },
    { id: "p5", name: "名取市マンション改修工事", workType: "改修工事", progressPct: 88, plannedPct: 80, quality: "good" },
  ];

  return (
    <table className="w-full table-fixed text-[10px] text-slate-700">
      <caption className="sr-only">現場別進捗</caption>
      <colgroup>
        <col />
        <col style={{ width: "60px" }} />
        <col style={{ width: "78px" }} />
        <col style={{ width: "30px" }} />
        <col style={{ width: "30px" }} />
        <col style={{ width: "20px" }} />
        <col style={{ width: "20px" }} />
      </colgroup>
      <thead className="text-slate-500">
        <tr className="border-b border-slate-100">
          <th scope="col" className="px-1 pb-1 text-left font-bold">現場名</th>
          <th scope="col" className="px-1 pb-1 text-left font-bold">工種</th>
          <th scope="col" className="px-1 pb-1 text-left font-bold">進捗率</th>
          <th scope="col" className="px-1 pb-1 text-right font-bold">予定</th>
          <th scope="col" className="px-1 pb-1 text-right font-bold">遅延</th>
          <th scope="col" className="px-0.5 pb-1 text-center font-bold">安全</th>
          <th scope="col" className="px-0.5 pb-1 text-center font-bold">品質</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {data.map((r) => {
          const delta = r.progressPct - r.plannedPct;
          return (
            <tr key={r.id} className="transition-colors hover:bg-slate-50">
              <td className="px-1 py-1">
                <Link
                  href={`/pc/projects/${r.id}`}
                  className="block truncate text-slate-900 hover:underline"
                  title={r.name}
                >
                  {r.name}
                </Link>
              </td>
              <td className="truncate px-1 py-1" title={r.workType}>
                {r.workType}
              </td>
              <td className="px-1 py-1">
                <div className="flex items-center gap-1">
                  <span className="w-7 text-right font-bold tabular-nums leading-tight text-slate-800">
                    {r.progressPct}%
                  </span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${r.progressPct}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-1 py-1 text-right tabular-nums text-slate-600">
                {r.plannedPct}%
              </td>
              <td
                className={`whitespace-nowrap px-1 py-1 text-right font-bold tabular-nums ${delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-600" : "text-slate-500"}`}
              >
                {delta > 0 ? `+${delta}%` : delta < 0 ? `${delta}%` : "±0"}
              </td>
              <td className="px-0.5 py-1 text-center">
                <ShieldCheck
                  className="mx-auto h-3 w-3 text-emerald-600"
                  aria-label="安全 OK"
                />
              </td>
              <td className="px-0.5 py-1 text-center">
                <ShieldCheck
                  className={`mx-auto h-3 w-3 ${r.quality === "good" ? "text-emerald-600" : "text-amber-500"}`}
                  aria-label={r.quality === "good" ? "品質 OK" : "品質 警告"}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
