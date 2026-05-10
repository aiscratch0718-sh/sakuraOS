import Link from "next/link";

export type SiteProgressRow = {
  id: string;
  name: string;
  status: "計画中" | "進行中" | "遅延" | "完了直前";
  progressPct: number;
  plannedPct: number;
  dueDate: string;
  owner: string;
};

const STATUS_STYLE: Record<SiteProgressRow["status"], string> = {
  計画中: "bg-purple-bg text-purple",
  進行中: "bg-blue-bg text-blue",
  遅延: "bg-red-bg text-red",
  完了直前: "bg-teal-bg text-teal",
};

/**
 * 現場別進捗(参照画像 下段左)。
 * 7 列構成: 現場名 / ステータス / 進捗 / 予定進捗 / 遅延 / 期日 / 担当。
 * TODO(P12-01-data): projects + work_packages テーブルから本実装。現状は暫定モック。
 */
export function SiteProgressTable({ rows }: { rows?: SiteProgressRow[] }) {
  const data: SiteProgressRow[] = rows ?? [
    {
      id: "p1",
      name: "駅前ビル給排水改修",
      status: "進行中",
      progressPct: 65,
      plannedPct: 70,
      dueDate: "5/25",
      owner: "田中",
    },
    {
      id: "p2",
      name: "マンション給湯設備工事",
      status: "進行中",
      progressPct: 80,
      plannedPct: 75,
      dueDate: "5/20",
      owner: "鈴木",
    },
    {
      id: "p3",
      name: "工場排水管更新",
      status: "遅延",
      progressPct: 40,
      plannedPct: 60,
      dueDate: "5/30",
      owner: "高橋",
    },
    {
      id: "p4",
      name: "商業施設配管点検",
      status: "完了直前",
      progressPct: 95,
      plannedPct: 95,
      dueDate: "5/15",
      owner: "伊藤",
    },
    {
      id: "p5",
      name: "集合住宅給水設備",
      status: "計画中",
      progressPct: 10,
      plannedPct: 15,
      dueDate: "6/10",
      owner: "渡辺",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <caption className="sr-only">現場別進捗</caption>
        <thead>
          <tr className="text-left text-ink-3 border-b border-line">
            <th scope="col" className="py-1.5 font-medium">現場名</th>
            <th scope="col" className="py-1.5 font-medium">ステータス</th>
            <th scope="col" className="py-1.5 font-medium min-w-[100px]">進捗</th>
            <th scope="col" className="py-1.5 font-medium text-right">予定</th>
            <th scope="col" className="py-1.5 font-medium text-right">遅延</th>
            <th scope="col" className="py-1.5 font-medium text-right">期日</th>
            <th scope="col" className="py-1.5 font-medium">担当</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => {
            const delta = r.progressPct - r.plannedPct;
            const deltaColor =
              delta > 0
                ? "text-teal"
                : delta === 0
                ? "text-ink-2"
                : delta <= -10
                ? "text-red"
                : "text-amber";
            const deltaLabel =
              delta > 0 ? `+${delta}%` : delta === 0 ? "±0%" : `${delta}%`;
            return (
              <tr key={r.id} className="border-b border-line/60 last:border-0">
                <td className="py-2 pr-2 font-bold text-ink">
                  <Link
                    href={`/pc/projects/${r.id}`}
                    className="hover:underline"
                  >
                    {r.name}
                  </Link>
                </td>
                <td className="py-2 pr-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${STATUS_STYLE[r.status]}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-2 pr-2">
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
                  </div>
                </td>
                <td className="py-2 pr-2 text-right text-ink-2 tabular-nums">
                  {r.plannedPct}%
                </td>
                <td className={`py-2 pr-2 text-right font-bold tabular-nums ${deltaColor}`}>
                  {deltaLabel}
                </td>
                <td className="py-2 pr-2 text-right text-ink-2 tabular-nums whitespace-nowrap">
                  {r.dueDate}
                </td>
                <td className="py-2 text-ink-2 whitespace-nowrap">{r.owner}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
