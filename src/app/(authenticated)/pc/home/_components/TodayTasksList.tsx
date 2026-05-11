import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

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
  必須: "border-red-300 text-red-600",
  確認: "border-orange-300 text-orange-600",
  対応: "border-blue-300 text-blue-600",
  情報: "border-slate-300 text-slate-600",
};

const ICON_STYLE: Record<TaskState, string> = {
  urgent: "text-red-500",
  warn: "text-orange-500",
  active: "text-blue-500",
  done: "text-slate-400",
};

export function TodayTasksList({ tasks }: { tasks?: TaskRow[] }) {
  const rows: TaskRow[] = tasks ?? [
    {
      tag: "必須",
      label: "REPORT3を入力する",
      count: 9,
      note: "未入力",
      state: "urgent",
      href: "/sp/report3",
    },
    {
      tag: "確認",
      label: "承認待ちを確認する",
      count: 18,
      state: "warn",
      href: "/pc/approvals",
    },
    {
      tag: "対応",
      label: "未請求の見積・請求を確認する",
      count: 7,
      state: "active",
      href: "/pc/invoices",
    },
    {
      tag: "情報",
      label: "クエストを進めてXPを獲得しよう",
      count: 2,
      note: "進行中",
      state: "done",
      href: "/pc/quests-badges",
    },
  ];

  return (
    <ul className="divide-y divide-slate-100">
      {rows.map((t) => (
        <li key={t.label}>
          <Link
            href={t.href}
            className="flex min-h-[42px] items-center gap-3 rounded-md px-1 transition-colors hover:bg-slate-50"
          >
            <CheckCircle2
              className={`h-[18px] w-[18px] flex-shrink-0 ${ICON_STYLE[t.state]}`}
              aria-hidden
            />
            <span
              className={`rounded border px-2 py-0.5 text-[11px] font-bold ${TAG_STYLE[t.tag]}`}
            >
              {t.tag}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-800">
              {t.label}
            </span>
            <span className="whitespace-nowrap text-[12px] text-slate-500">
              {t.note} {t.count}件
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
