import Link from "next/link";

export type ApprovalRow = {
  id: string;
  kind: "原価" | "見積" | "請求" | "残業" | "工具" | "経費";
  projectName: string;
  applicant: string;
  amountYen: number;
  elapsed: string;
  href: string;
};

const KIND_STYLE: Record<ApprovalRow["kind"], string> = {
  原価: "bg-purple-bg text-purple",
  見積: "bg-blue-bg text-blue",
  請求: "bg-teal-bg text-teal",
  残業: "bg-amber-bg text-amber",
  工具: "bg-blue-bg text-blue",
  経費: "bg-graybg text-ink-2",
};

/**
 * 承認待ち一覧(承認者用ホームに表示)。
 * 5 列構成: 種別 / 案件名 / 申請者 / 金額 / 経過時間。
 * TODO(P12-01-data): report3_entries / estimates / invoices の承認待ちを集約。
 */
export function ApprovalQueueTable({ rows }: { rows?: ApprovalRow[] }) {
  const data: ApprovalRow[] = rows ?? [
    {
      id: "a1",
      kind: "原価",
      projectName: "駅前ビル給排水改修",
      applicant: "田中現場主任",
      amountYen: 320000,
      elapsed: "2時間前",
      href: "/pc/approvals",
    },
    {
      id: "a2",
      kind: "残業",
      projectName: "マンション給湯設備工事",
      applicant: "鈴木技術者",
      amountYen: 18000,
      elapsed: "4時間前",
      href: "/pc/approvals",
    },
    {
      id: "a3",
      kind: "工具",
      projectName: "工場排水管更新",
      applicant: "高橋現場リーダー",
      amountYen: 45000,
      elapsed: "6時間前",
      href: "/pc/approvals",
    },
    {
      id: "a4",
      kind: "経費",
      projectName: "商業施設配管点検",
      applicant: "伊藤事務",
      amountYen: 12500,
      elapsed: "1日前",
      href: "/pc/approvals",
    },
    {
      id: "a5",
      kind: "見積",
      projectName: "集合住宅給水設備",
      applicant: "渡辺営業",
      amountYen: 1250000,
      elapsed: "1日前",
      href: "/pc/approvals",
    },
  ];

  if (data.length === 0) {
    return (
      <p className="text-[12px] text-ink-3 py-6 text-center">
        承認待ちはありません。
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <caption className="sr-only">承認待ち一覧</caption>
        <thead>
          <tr className="text-left text-ink-3 border-b border-line">
            <th scope="col" className="py-1.5 font-medium">種別</th>
            <th scope="col" className="py-1.5 font-medium">案件名</th>
            <th scope="col" className="py-1.5 font-medium">申請者</th>
            <th scope="col" className="py-1.5 font-medium text-right">金額</th>
            <th scope="col" className="py-1.5 font-medium text-right">経過時間</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-panel2 transition-colors">
              <td className="py-2 pr-2">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${KIND_STYLE[r.kind]} whitespace-nowrap`}
                >
                  {r.kind}
                </span>
              </td>
              <td className="py-2 pr-2 font-bold text-ink">
                <Link href={r.href} className="hover:underline">
                  {r.projectName}
                </Link>
              </td>
              <td className="py-2 pr-2 text-ink-2">{r.applicant}</td>
              <td className="py-2 pr-2 text-right font-extrabold text-navy whitespace-nowrap tabular-nums">
                ¥{r.amountYen.toLocaleString("ja-JP")}
              </td>
              <td className="py-2 text-right text-ink-3 whitespace-nowrap">
                {r.elapsed}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
