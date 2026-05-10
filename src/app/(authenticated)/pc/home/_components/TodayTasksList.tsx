import Link from "next/link";

type TaskState = "urgent" | "warn" | "active" | "done";

type TaskRow = {
  tag: "必須" | "確認" | "対応" | "情報";
  label: string;
  count: number;
  note?: string;
  state: TaskState;
  href: string;
};

const TAG_STYLE: Record<TaskRow["tag"], string> = {
  必須: "bg-red-50 text-red-700",
  確認: "bg-amber-50 text-amber-700",
  対応: "bg-blue-50 text-blue-700",
  情報: "bg-gray-100 text-gray-600",
};

const STATE_STYLE: Record<TaskState, { label: string; cls: string }> = {
  urgent: { label: "緊急", cls: "bg-red-50 text-red-700" },
  warn: { label: "要対応", cls: "bg-amber-50 text-amber-700" },
  active: { label: "進行中", cls: "bg-blue-50 text-blue-700" },
  done: { label: "完了", cls: "bg-green-50 text-green-700" },
};

/**
 * 今日のやることリスト(参照画像準拠 4 行)。
 * TODO(P12-01-data): tasks テーブル + 承認/期限切れ集計から本実装。
 */
export function TodayTasksList({ tasks }: { tasks?: TaskRow[] }) {
  const rows: TaskRow[] = tasks ?? [
    {
      tag: "必須",
      label: "REPORT3 提出",
      count: 9,
      note: "期限あり",
      state: "urgent",
      href: "/sp/report3",
    },
    {
      tag: "確認",
      label: "承認待ち案件",
      count: 18,
      state: "warn",
      href: "/pc/approvals",
    },
    {
      tag: "対応",
      label: "未請求案件",
      count: 7,
      state: "active",
      href: "/pc/invoices",
    },
    {
      tag: "情報",
      label: "クエスト未達成",
      count: 2,
      state: "done",
      href: "/pc/badges",
    },
  ];

  return (
    <ul className="divide-y divide-gray-100">
      {rows.map((t, i) => {
        const state = STATE_STYLE[t.state];
        return (
          <li key={i}>
            <Link
              href={t.href}
              className="flex items-center gap-2.5 py-2.5 px-1 hover:bg-gray-50 transition-colors"
            >
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${TAG_STYLE[t.tag]}`}
              >
                {t.tag}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-gray-900 truncate">{t.label}</div>
                {t.note && (
                  <div className="text-[10px] text-gray-400">{t.note}</div>
                )}
              </div>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${state.cls}`}
                aria-label={`状態: ${state.label}`}
              >
                {state.label}
              </span>
              <span className="text-[12px] font-semibold text-gray-900 tabular-nums">
                {t.count}
                <span className="text-[10px] text-gray-400 ml-0.5">件</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
