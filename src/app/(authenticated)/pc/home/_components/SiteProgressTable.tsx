import Link from "next/link";

export type SiteProgressRow = {
  id: string;
  name: string;
  craft: string;
  progressPct: number;
  plannedPct: number;
  safety: "ok" | "warn" | "ng";
  quality: "ok" | "warn" | "ng";
};

const BADGE: Record<SiteProgressRow["safety"], { label: string; cls: string }> = {
  ok: { label: "✓", cls: "bg-teal-bg text-teal" },
  warn: { label: "△", cls: "bg-amber-bg text-amber" },
  ng: { label: "⚠", cls: "bg-red-bg text-red" },
};

/**
 * 現場別進捗(参照画像 下段左)。
 * 進捗バー + 予定進捗との差分を併記。安全/品質をバッジで可視化。
 * TODO(P12-01-data): projects + work_packages テーブルから本実装。現状は暫定モック。
 */
export function SiteProgressTable({ rows }: { rows?: SiteProgressRow[] }) {
  const data: SiteProgressRow[] = rows ?? [
    { id: "p1", name: "○○ビル配管改修", craft: "配管", progressPct: 72, plannedPct: 70, safety: "ok", quality: "ok" },
    { id: "p2", name: "△△マンション新築", craft: "給排水", progressPct: 48, plannedPct: 55, safety: "warn", quality: "ok" },
    { id: "p3", name: "□□工場メンテ", craft: "保守", progressPct: 91, plannedPct: 88, safety: "ok", quality: "ok" },
    { id: "p4", name: "××病院増築", craft: "配管", progressPct: 33, plannedPct: 40, safety: "ok", quality: "warn" },
    { id: "p5", name: "◇◇店舗改装", craft: "給湯", progressPct: 65, plannedPct: 60, safety: "ok", quality: "ok" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-left text-ink-3 border-b border-line">
            <th className="py-1.5 font-medium">現場名</th>
            <th className="py-1.5 font-medium">工種</th>
            <th className="py-1.5 font-medium min-w-[120px]">進捗</th>
            <th className="py-1.5 font-medium text-center">安全</th>
            <th className="py-1.5 font-medium text-center">品質</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => {
            const delta = r.progressPct - r.plannedPct;
            const deltaColor =
              delta >= 0 ? "text-teal" : delta <= -5 ? "text-red" : "text-amber";
            return (
              <tr key={r.id} className="border-b border-line/60 last:border-0">
                <td className="py-2 font-bold text-ink">
                  <Link
                    href={`/pc/projects/${r.id}`}
                    className="hover:underline"
                  >
                    {r.name}
                  </Link>
                </td>
                <td className="py-2 text-ink-2">{r.craft}</td>
                <td className="py-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="flex-1 h-1.5 rounded-full bg-graybg overflow-hidden"
                      role="progressbar"
                      aria-valuenow={r.progressPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${r.name} 進捗 ${r.progressPct}%`}
                    >
                      <div
                        className="h-full bg-blue"
                        style={{ width: `${Math.min(100, r.progressPct)}%` }}
                      />
                    </div>
                    <span className="font-bold text-ink tabular-nums w-8 text-right">
                      {r.progressPct}%
                    </span>
                    <span className={`font-bold tabular-nums w-10 text-right ${deltaColor}`}>
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
                  </div>
                </td>
                <td className="py-2 text-center">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${BADGE[r.safety].cls}`}
                    aria-label={`安全: ${r.safety}`}
                  >
                    {BADGE[r.safety].label}
                  </span>
                </td>
                <td className="py-2 text-center">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${BADGE[r.quality].cls}`}
                    aria-label={`品質: ${r.quality}`}
                  >
                    {BADGE[r.quality].label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
