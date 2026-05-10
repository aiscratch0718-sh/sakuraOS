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
  計画中: "bg-gray-100 text-gray-600",
  進行中: "bg-blue-50 text-blue-700",
  遅延: "bg-red-50 text-red-700",
  完了直前: "bg-green-50 text-green-700",
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
      <table className="w-full text-[12px] text-gray-700">
        <caption className="sr-only">現場別進捗</caption>
        <thead className="bg-gray-50 text-gray-500">
          <tr className="text-left">
            <th scope="col" className="py-2 px-2 font-medium">現場名</th>
            <th scope="col" className="py-2 px-2 font-medium">ステータス</th>
            <th scope="col" className="py-2 px-2 font-medium min-w-[100px]">進捗</th>
            <th scope="col" className="py-2 px-2 font-medium text-right">予定</th>
            <th scope="col" className="py-2 px-2 font-medium text-right">遅延</th>
            <th scope="col" className="py-2 px-2 font-medium text-right">期日</th>
            <th scope="col" className="py-2 px-2 font-medium">担当</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((r) => {
            const delta = r.progressPct - r.plannedPct;
            const deltaColor =
              delta > 0
                ? "text-green-600"
                : delta === 0
                ? "text-gray-500"
                : "text-red-600";
            const deltaLabel =
              delta > 0 ? `+${delta}%` : delta === 0 ? "±0%" : `${delta}%`;
            return (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-2 px-2 text-gray-900">
                  <Link
                    href={`/pc/projects/${r.id}`}
                    className="hover:underline"
                  >
                    {r.name}
                  </Link>
                </td>
                <td className="py-2 px-2">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLE[r.status]}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden"
                      role="progressbar"
                      aria-valuenow={r.progressPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${r.name} 進捗 ${r.progressPct}%`}
                    >
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, r.progressPct)}%` }}
                      />
                    </div>
                    <span className="font-medium text-gray-900 tabular-nums w-8 text-right">
                      {r.progressPct}%
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2 text-right text-gray-600 tabular-nums">
                  {r.plannedPct}%
                </td>
                <td className={`py-2 px-2 text-right font-medium tabular-nums ${deltaColor}`}>
                  {deltaLabel}
                </td>
                <td className="py-2 px-2 text-right text-gray-600 tabular-nums whitespace-nowrap">
                  {r.dueDate}
                </td>
                <td className="py-2 px-2 text-gray-600 whitespace-nowrap">{r.owner}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
