import Link from "next/link";

export type ApprovalRow = {
  id: string;
  applicant: string;
  appliedDate: string; // YYYY-MM-DD
  kind: "原価" | "見積" | "請求";
  amountYen: number;
  href: string;
};

const KIND_STYLE: Record<ApprovalRow["kind"], string> = {
  原価: "bg-purple-bg text-purple",
  見積: "bg-blue-bg text-blue",
  請求: "bg-teal-bg text-teal",
};

/**
 * 承認待ち一覧(承認者用ホームに表示)。
 * TODO(P12-01-data): report3_entries / estimates / invoices の承認待ちを集約。
 */
export function ApprovalQueueTable({ rows }: { rows?: ApprovalRow[] }) {
  const data: ApprovalRow[] = rows ?? [
    { id: "1", applicant: "山田 太郎", appliedDate: "2026-05-10", kind: "原価", amountYen: 124000, href: "/pc/approvals" },
    { id: "2", applicant: "佐藤 花子", appliedDate: "2026-05-10", kind: "見積", amountYen: 1850000, href: "/pc/approvals" },
    { id: "3", applicant: "鈴木 一郎", appliedDate: "2026-05-09", kind: "請求", amountYen: 4200000, href: "/pc/approvals" },
    { id: "4", applicant: "田中 二郎", appliedDate: "2026-05-09", kind: "原価", amountYen: 56000, href: "/pc/approvals" },
    { id: "5", applicant: "高橋 三郎", appliedDate: "2026-05-08", kind: "見積", amountYen: 980000, href: "/pc/approvals" },
  ];

  if (data.length === 0) {
    return (
      <p className="text-[12px] text-ink-3 py-6 text-center">
        承認待ちはありません。
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {data.map((r) => (
        <li key={r.id}>
          <Link
            href={r.href}
            className="flex items-center gap-2 py-2 hover:bg-panel2 px-1 rounded-btn transition-colors"
          >
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${KIND_STYLE[r.kind]} flex-shrink-0`}
            >
              {r.kind}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-ink truncate">
                {r.applicant}
              </div>
              <div className="text-[10px] text-ink-3">{r.appliedDate}</div>
            </div>
            <div className="text-[12px] font-extrabold text-navy whitespace-nowrap">
              ¥{r.amountYen.toLocaleString("ja-JP")}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
