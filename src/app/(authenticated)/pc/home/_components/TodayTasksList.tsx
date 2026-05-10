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
  必須: "bg-red-bg text-red",
  確認: "bg-amber-bg text-amber",
  対応: "bg-blue-bg text-blue",
  情報: "bg-graybg text-ink-2",
};

const STATE_STYLE: Record<TaskState, { label: string; cls: string }> = {
  urgent: { label: "緊急", cls: "bg-red-bg text-red" },
  warn: { label: "要対応", cls: "bg-amber-bg text-amber" },
  active: { label: "進行中", cls: "bg-blue-bg text-blue" },
  done: { label: "完了", cls: "bg-teal-bg text-teal" },
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
    <ul className="space-y-2">
      {rows.map((t, i) => {
        const state = STATE_STYLE[t.state];
        return (
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
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-ink truncate">{t.label}</div>
                {t.note && (
                  <div className="text-[10px] text-ink-3">{t.note}</div>
                )}
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-pill ${state.cls}`}
                aria-label={`状態: ${state.label}`}
              >
                {state.label}
              </span>
              <span className="text-[12px] font-extrabold text-navy tabular-nums">
                {t.count}
                <span className="text-[10px] text-ink-3 ml-0.5">件</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
