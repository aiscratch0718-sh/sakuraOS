"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  CircleHelp,
  ClipboardEdit,
  FileCheck,
  Megaphone,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { MetricCard, PageHeader } from "@/components/ui";
import {
  CATEGORY_META,
  type NotificationCategory,
  type NotificationPriority,
  type NotificationRow,
  type NotificationStatus,
  PRIORITY_META,
} from "./_data/mock-notifications";

type CategoryFilter = "all" | NotificationCategory;
type PriorityFilter = "all" | NotificationPriority;
type StatusFilter = "all" | NotificationStatus;

// カテゴリ → アイコン
const CATEGORY_ICON: Record<NotificationCategory, typeof Bell> = {
  report3: ClipboardEdit,
  approval: FileCheck,
  qualification: ShieldCheck,
  incident: ShieldAlert,
  project: TrendingUp,
  system: Megaphone,
};

export function NotificationsClient({
  notifications,
}: {
  notifications: NotificationRow[];
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string>(
    notifications[0]?.id ?? "",
  );

  // KPI 計算
  const kpis = useMemo(() => {
    const unread = notifications.filter((n) => n.status === "unread").length;
    const urgent = notifications.filter((n) => n.priority === "urgent").length;
    const warn = notifications.filter((n) => n.priority === "warn").length;
    const read = notifications.filter((n) => n.status === "read").length;
    return { unread, urgent, warn, read };
  }, [notifications]);

  // フィルタ
  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (categoryFilter !== "all" && n.category !== categoryFilter)
        return false;
      if (priorityFilter !== "all" && n.priority !== priorityFilter)
        return false;
      if (statusFilter !== "all" && n.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !n.title.toLowerCase().includes(q) &&
          !n.detail.toLowerCase().includes(q) &&
          !(n.related ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [notifications, search, categoryFilter, priorityFilter, statusFilter]);

  const selected =
    notifications.find((n) => n.id === selectedId) ??
    filtered[0] ??
    notifications[0];

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
      <main className="flex flex-1 flex-col gap-3 px-4 py-3">
        {/* ヘッダー */}
        <PageHeader
          breadcrumbs={[
            { label: "ホーム", href: "/pc/home" },
            { label: "通知" },
          ]}
          icon={Bell}
          title="通知"
          subtitle="すべての通知・アラート・承認依頼をここで一括管理。"
          actions={
            <>
              <button
                type="button"
                aria-label="検索"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
              >
                <Search className="h-5 w-5 text-slate-700" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="ヘルプ"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
              >
                <CircleHelp className="h-5 w-5 text-slate-700" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="通知"
                className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
              >
                <Bell className="h-5 w-5 text-slate-700" aria-hidden />
                {kpis.unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 rounded-full bg-rose-600 px-1 py-0.5 text-[9px] font-bold leading-none text-white">
                    {kpis.unread}
                  </span>
                )}
              </button>
            </>
          }
        />

        {/* 上段 KPI 4 cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Bell}
            accent="border-l-blue-500"
            iconColor="text-blue-600"
            label="未読"
            value={`${kpis.unread} 件`}
            subText="新規通知"
          />
          <MetricCard
            icon={AlertCircle}
            accent="border-l-rose-500"
            iconColor="text-rose-600"
            label="緊急"
            value={`${kpis.urgent} 件`}
            subText="即対応"
          />
          <MetricCard
            icon={ShieldAlert}
            accent="border-l-amber-500"
            iconColor="text-amber-600"
            label="要対応"
            value={`${kpis.warn} 件`}
            subText="承認・期限"
          />
          <MetricCard
            icon={CheckCircle2}
            accent="border-l-emerald-500"
            iconColor="text-emerald-600"
            label="既読"
            value={`${kpis.read} 件`}
            subText="対応済"
          />
        </div>

        {/* Filter bar + 2-pane */}
        <div className="grid flex-1 grid-cols-12 gap-3">
          {/* 左 8: filter + list */}
          <div className="col-span-12 flex flex-col gap-2 lg:col-span-8">
            {/* Filter bar */}
            <section className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="タイトル / 内容 / 関連で検索"
                  className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-7 pr-2 text-[12px] focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <FilterSelect
                value={categoryFilter}
                onChange={(v) => setCategoryFilter(v as CategoryFilter)}
                label="カテゴリ"
                options={[
                  { value: "all", label: "全て" },
                  { value: "report3", label: "REPORT3" },
                  { value: "approval", label: "承認" },
                  { value: "qualification", label: "資格" },
                  { value: "incident", label: "安全" },
                  { value: "project", label: "案件" },
                  { value: "system", label: "システム" },
                ]}
              />
              <FilterSelect
                value={priorityFilter}
                onChange={(v) => setPriorityFilter(v as PriorityFilter)}
                label="優先度"
                options={[
                  { value: "all", label: "全て" },
                  { value: "urgent", label: "緊急" },
                  { value: "warn", label: "要対応" },
                  { value: "info", label: "情報" },
                ]}
              />
              <FilterSelect
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as StatusFilter)}
                label="状態"
                options={[
                  { value: "all", label: "全て" },
                  { value: "unread", label: "未読" },
                  { value: "read", label: "既読" },
                ]}
              />
              <div className="text-[11px] text-slate-500">
                <span className="font-bold text-slate-900">{filtered.length}</span>{" "}
                / {notifications.length} 件
              </div>
            </section>

            {/* Notification list */}
            <section className="flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <ul className="divide-y divide-slate-100" role="list">
                {filtered.map((n) => {
                  const isSelected = n.id === selected?.id;
                  return (
                    <NotificationListItem
                      key={n.id}
                      notification={n}
                      selected={isSelected}
                      onSelect={() => setSelectedId(n.id)}
                    />
                  );
                })}
                {filtered.length === 0 && (
                  <li className="px-3 py-8 text-center text-[12px] text-slate-500">
                    該当する通知がありません。フィルタ条件を変えてください。
                  </li>
                )}
              </ul>
            </section>
          </div>

          {/* 右 4: detail panel */}
          <aside className="col-span-12 lg:col-span-4">
            {selected ? (
              <NotificationDetailPanel notification={selected} />
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-[12px] text-slate-500">
                通知を選択してください
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}


function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex items-center gap-1 text-[11px] text-slate-500">
      <span className="hidden md:inline">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NotificationListItem({
  notification,
  selected,
  onSelect,
}: {
  notification: NotificationRow;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = CATEGORY_ICON[notification.category];
  const catMeta = CATEGORY_META[notification.category];
  const priMeta = PRIORITY_META[notification.priority];
  const isUnread = notification.status === "unread";

  return (
    <li>
      <button
        type="button"
        aria-current={selected ? "true" : undefined}
        onClick={onSelect}
        className={`flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors ${
          selected ? "bg-blue-50" : "hover:bg-slate-50"
        }`}
      >
        {/* カテゴリアイコン */}
        <span
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${catMeta.bg} ${catMeta.iconColor}`}
          aria-hidden
        >
          <Icon className="h-3.5 w-3.5" />
        </span>

        {/* 中央: タイトル + 詳細 + 関連 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {isUnread && (
              <span
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"
                aria-label="未読"
              />
            )}
            <div
              className={`truncate text-[12px] ${
                isUnread ? "font-bold text-slate-950" : "font-medium text-slate-700"
              }`}
            >
              {notification.title}
            </div>
          </div>
          <div className="mt-0.5 truncate text-[11px] text-slate-500">
            {notification.detail}
          </div>
          {notification.related && (
            <div className="mt-0.5 truncate text-[10px] text-slate-400">
              関連: {notification.related}
            </div>
          )}
        </div>

        {/* 右: 優先度 pill + 時刻 */}
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <span
            className={`inline-flex items-center gap-0.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${priMeta.pill}`}
          >
            <span className={`h-1 w-1 rounded-full ${priMeta.dot}`} aria-hidden />
            {priMeta.label}
          </span>
          <span className="whitespace-nowrap text-[10px] text-slate-400">
            {notification.elapsed}
          </span>
        </div>
      </button>
    </li>
  );
}

function NotificationDetailPanel({
  notification,
}: {
  notification: NotificationRow;
}) {
  const Icon = CATEGORY_ICON[notification.category];
  const catMeta = CATEGORY_META[notification.category];
  const priMeta = PRIORITY_META[notification.priority];

  return (
    <section className="flex flex-col gap-2">
      {/* Header */}
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="mb-2 flex items-start gap-2">
          <span
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${catMeta.bg} ${catMeta.iconColor}`}
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${priMeta.pill}`}
              >
                <span
                  className={`h-1 w-1 rounded-full ${priMeta.dot}`}
                  aria-hidden
                />
                {priMeta.label}
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {catMeta.label}
              </span>
            </div>
            <h2 className="mt-1 text-[14px] font-black leading-tight text-slate-950">
              {notification.title}
            </h2>
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-700">
          {notification.detail}
        </p>
      </div>

      {/* Meta */}
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <h3 className="mb-2 text-[12px] font-black text-slate-950">情報</h3>
        <dl className="space-y-1.5 text-[11px]">
          <Row label="受信日時" value={notification.createdAt} />
          <Row label="経過" value={notification.elapsed} />
          {notification.related && (
            <Row label="関連" value={notification.related} />
          )}
          <Row
            label="状態"
            value={notification.status === "unread" ? "未読" : "既読"}
          />
        </dl>
      </div>

      {/* Actions */}
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <h3 className="mb-2 text-[12px] font-black text-slate-950">
          クイックアクション
        </h3>
        <div className="flex flex-col gap-1.5">
          {notification.actionLabel && (
            <Link
              href={notification.href}
              className="flex items-center justify-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700 transition-colors hover:bg-blue-100"
            >
              {notification.actionLabel}
            </Link>
          )}
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            {notification.status === "unread" ? "既読にする" : "未読に戻す"}
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-50"
          >
            アーカイブ
          </button>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="break-words text-right font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}
