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
  原価: "bg-blue-50 text-blue-700",
  見積: "bg-teal-50 text-teal-700",
  請求: "bg-teal-50 text-teal-700",
  残業: "bg-amber-50 text-amber-700",
  工具: "bg-purple-50 text-purple-700",
  経費: "bg-green-50 text-green-700",
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
      <p className="text-[12px] text-gray-400 py-6 text-center">
        承認待ちはありません。
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px] text-gray-700">
        <caption className="sr-only">承認待ち一覧</caption>
        <thead className="bg-gray-50 text-gray-500">
          <tr className="text-left">
            <th scope="col" className="py-2 px-2 font-medium">種別</th>
            <th scope="col" className="py-2 px-2 font-medium">案件名</th>
            <th scope="col" className="py-2 px-2 font-medium">申請者</th>
            <th scope="col" className="py-2 px-2 font-medium text-right">金額</th>
            <th scope="col" className="py-2 px-2 font-medium text-right">経過時間</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-2 px-2">
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${KIND_STYLE[r.kind]} whitespace-nowrap`}
                >
                  {r.kind}
                </span>
              </td>
              <td className="py-2 px-2 text-gray-900">
                <Link href={r.href} className="hover:underline">
                  {r.projectName}
                </Link>
              </td>
              <td className="py-2 px-2 text-gray-600">{r.applicant}</td>
              <td className="py-2 px-2 text-right font-semibold text-gray-900 whitespace-nowrap tabular-nums">
                ¥{r.amountYen.toLocaleString("ja-JP")}
              </td>
              <td className="py-2 px-2 text-right text-gray-400 text-[11px] whitespace-nowrap">
                {r.elapsed}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
