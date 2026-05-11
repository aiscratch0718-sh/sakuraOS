import Link from "next/link";

export type ApprovalRow = {
  id: string;
  kind: "原価" | "見積" | "請求" | "残業" | "工具" | "経費";
  projectName: string;
  applicant: string;
  amountYen: number;
  /** 申請からの経過時間表記(例: "2時間前", "4時間前", "1日前")。参照画像準拠 */
  elapsed: string;
  href: string;
};

const KIND_STYLE: Record<ApprovalRow["kind"], string> = {
  原価: "border-blue-300 text-blue-700",
  見積: "border-blue-300 text-blue-700",
  請求: "border-orange-300 text-orange-700",
  残業: "border-amber-300 text-amber-700",
  工具: "border-purple-300 text-purple-700",
  経費: "border-green-300 text-green-700",
};

export function ApprovalQueueTable({ rows }: { rows?: ApprovalRow[] }) {
  // 参照画像準拠: 申請日 → 経過時間表記、5行で構成
  // TODO(P12-01-data): 本実装まで暫定。approvals テーブルから取得に置き換える
  const data: ApprovalRow[] = rows ?? [
    {
      id: "a1",
      kind: "原価",
      projectName: "駅前ビル給排水改修",
      applicant: "田中 現場主任",
      amountYen: 320000,
      elapsed: "2時間前",
      href: "/pc/approvals",
    },
    {
      id: "a2",
      kind: "残業",
      projectName: "マンション給湯設備工事",
      applicant: "鈴木 技術",
      amountYen: 18000,
      elapsed: "4時間前",
      href: "/pc/approvals",
    },
    {
      id: "a3",
      kind: "工具",
      projectName: "工場排水管更新",
      applicant: "高橋 リーダー",
      amountYen: 45000,
      elapsed: "6時間前",
      href: "/pc/approvals",
    },
    {
      id: "a4",
      kind: "経費",
      projectName: "商業施設配管点検",
      applicant: "伊藤 事務",
      amountYen: 12500,
      elapsed: "1日前",
      href: "/pc/approvals",
    },
    {
      id: "a5",
      kind: "見積",
      projectName: "集合住宅給水設備",
      applicant: "渡辺 営業",
      amountYen: 1250000,
      elapsed: "1日前",
      href: "/pc/approvals",
    },
  ];

  return (
    <ul className="divide-y divide-slate-100 text-[11px] text-slate-700">
      {data.map((r) => (
        <li key={r.id} className="flex items-center gap-1.5 py-0.5">
          {/* 左: 種別 badge */}
          <span
            className={`inline-block w-9 flex-shrink-0 whitespace-nowrap rounded border px-1 py-0.5 text-center text-[10px] font-bold ${KIND_STYLE[r.kind]}`}
          >
            {r.kind}
          </span>
          {/* 中央: 案件名(1 行目) + 申請者・経過時間(2 行目) */}
          <div className="min-w-0 flex-1">
            <Link
              href={r.href}
              className="block truncate text-[11px] font-medium text-slate-900 hover:underline"
            >
              {r.projectName}
            </Link>
            <div className="truncate text-[10px] text-slate-500">
              {r.applicant} · {r.elapsed}
            </div>
          </div>
          {/* 右: 金額 */}
          <span className="whitespace-nowrap text-right text-[11px] font-bold text-slate-900">
            ¥{r.amountYen.toLocaleString("ja-JP")}
          </span>
        </li>
      ))}
    </ul>
  );
}
