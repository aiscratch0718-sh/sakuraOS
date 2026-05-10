import Link from "next/link";

type TaskRow = {
  tag: "必須" | "確認" | "対応" | "情報";
  label: string;
  count: number;
  href: string;
};

const TAG_STYLE: Record<TaskRow["tag"], string> = {
  必須: "bg-red-bg text-red",
  確認: "bg-amber-bg text-amber",
  対応: "bg-blue-bg text-blue",
  情報: "bg-graybg text-ink-2",
};

/**
 * 今日のやることリスト。
 * TODO(P12-01-data): tasks テーブル + 承認/期限切れ集計から本実装。
 * 現状は暫定モックでレイアウト確認用。
 */
export function TodayTasksList({ tasks }: { tasks?: TaskRow[] }) {
  const rows: TaskRow[] = tasks ?? [
    { tag: "必須", label: "本日の REPORT3 を入力", count: 1, href: "/sp/report3" },
    { tag: "確認", label: "見積の承認待ち", count: 3, href: "/pc/estimates" },
    { tag: "対応", label: "資格期限切れ間近のメンバー", count: 2, href: "/pc/qualifications" },
    { tag: "情報", label: "未読のお知らせ", count: 4, href: "/pc/notices" },
  ];

  return (
    <ul className="space-y-2">
      {rows.map((t, i) => (
        <li key={i}>
          <Link
            href={t.href}
            className="flex items-center gap-2.5 p-2.5 rounded-card border border-line hover:bg-panel2 transition-colors"
          >
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-pill ${TAG_STYLE[t.tag]}`}
            >
              {t.tag}
            </span>
            <span className="flex-1 text-[12px] text-ink min-w-0 truncate">
              {t.label}
            </span>
            <span className="text-[12px] font-extrabold text-navy">
              {t.count}
              <span className="text-[10px] text-ink-3 ml-0.5">件</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
