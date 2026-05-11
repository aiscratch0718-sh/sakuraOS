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
    <ul className="divide-y divide-slate-100">
      {data.map((r) => {
        const delta = r.progressPct - r.plannedPct;
        return (
          <li key={r.id} className="flex items-center gap-1.5 py-0.5">
            {/* 現場名(case 上) + 工種(下、小さく) */}
            <div className="min-w-0 flex-1">
              <Link
                href={`/pc/projects/${r.id}`}
                className="block truncate text-[10px] font-medium leading-tight text-slate-900 hover:underline"
              >
                {r.name}
              </Link>
              <div className="truncate text-[9px] leading-tight text-slate-500">
                {r.workType}
              </div>
            </div>
            {/* 進捗率 + バー */}
            <div className="flex w-[96px] flex-shrink-0 flex-col items-end gap-0">
              <div className="flex w-full items-center gap-1">
                <span className="w-6 text-right text-[10px] font-bold tabular-nums leading-tight text-slate-800">
                  {r.progressPct}%
                </span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${r.progressPct}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 text-[9px] leading-tight text-slate-500">
                <span>予定 {r.plannedPct}%</span>
                <span
                  className={`font-bold tabular-nums ${delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-600" : "text-slate-500"}`}
                >
                  {delta > 0 ? `+${delta}%` : delta < 0 ? `${delta}%` : "±0%"}
                </span>
              </div>
            </div>
            {/* 安全 / 品質 アイコン */}
            <div className="flex flex-shrink-0 items-center gap-0.5">
              <ShieldCheck className="h-3 w-3 text-emerald-600" aria-label="安全 OK" />
              <ShieldCheck
                className={`h-3 w-3 ${r.quality === "good" ? "text-emerald-600" : "text-amber-500"}`}
                aria-label={r.quality === "good" ? "品質 OK" : "品質 警告"}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
