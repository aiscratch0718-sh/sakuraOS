"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Briefcase,
  Calendar,
  CalendarClock,
  CheckCircle2,
  CircleHelp,
  ClipboardEdit,
  HardHat,
  MapPin,
  Plus,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { MetricCard, PageHeader } from "@/components/ui";
import {
  type ProjectRow,
  type ProjectStatus,
  STATUS_META,
} from "./_data/mock-projects";

type SortKey = "name" | "startedAt" | "dueAt" | "contractYen" | "progressPct";
type SortDir = "asc" | "desc";

type StatusFilter = "all" | ProjectStatus;

export function ProjectsListClient({
  projects,
  canEdit,
}: {
  projects: ProjectRow[];
  canEdit: boolean;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [workTypeFilter, setWorkTypeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("dueAt");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedId, setSelectedId] = useState<string>(projects[0]?.id ?? "");

  // 工種ユニーク一覧
  const workTypes = useMemo(
    () => Array.from(new Set(projects.map((p) => p.workType))).sort(),
    [projects],
  );

  // フィルタ + ソート
  const filtered = useMemo(() => {
    let result = projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (workTypeFilter !== "all" && p.workType !== workTypeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.customer.toLowerCase().includes(q) &&
          !p.code.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
    result = [...result].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va === vb) return 0;
      const sign = sortDir === "asc" ? 1 : -1;
      return va > vb ? sign : -sign;
    });
    return result;
  }, [projects, search, statusFilter, workTypeFilter, sortKey, sortDir]);

  // KPI 計算
  const kpis = useMemo(() => {
    const active = projects.filter((p) => p.status === "active");
    const delayed = projects.filter((p) => p.status === "delayed");
    const upcoming = projects.filter((p) => p.status === "upcoming");
    const completed = projects.filter((p) => p.status === "completed");
    return {
      active: {
        count: active.length,
        sumYen: active.reduce((s, p) => s + p.contractYen, 0),
      },
      delayed: { count: delayed.length },
      upcoming: { count: upcoming.length },
      completed: { count: completed.length },
    };
  }, [projects]);

  const selected =
    projects.find((p) => p.id === selectedId) ?? filtered[0] ?? projects[0];

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
      <main className="flex flex-1 flex-col gap-3 px-4 py-3">
        {/* ヘッダー */}
        <PageHeader
          breadcrumbs={[
            { label: "ホーム", href: "/pc/home" },
            { label: "案件管理" },
          ]}
          icon={Briefcase}
          title="案件管理"
          subtitle="すべての案件の状況を一括で確認・管理できます。"
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
                <span className="absolute -right-0.5 -top-0.5 rounded-full bg-rose-600 px-1 py-0.5 text-[9px] font-bold leading-none text-white">
                  12
                </span>
              </button>
              {canEdit && (
                <Link
                  href="/pc/projects/new"
                  className="flex items-center gap-1 rounded-md bg-blue-700 px-3 py-1.5 text-[12px] font-bold text-white shadow-sm hover:bg-blue-800"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  新規案件を登録
                </Link>
              )}
            </>
          }
        />

        {/* 上部 KPI 4 cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Briefcase}
            accent="border-l-blue-500"
            iconColor="text-blue-600"
            label="進行中の案件"
            value={`${kpis.active.count} 件`}
            subText={`¥${kpis.active.sumYen.toLocaleString("ja-JP")}`}
          />
          <MetricCard
            icon={CalendarClock}
            accent="border-l-amber-500"
            iconColor="text-amber-600"
            label="完了予定"
            value={`${kpis.upcoming.count} 件`}
            subText="今月着工予定"
          />
          <MetricCard
            icon={AlertTriangle}
            accent="border-l-rose-500"
            iconColor="text-rose-600"
            label="遅延"
            value={`${kpis.delayed.count} 件`}
            subText="要対応"
          />
          <MetricCard
            icon={CheckCircle2}
            accent="border-l-emerald-500"
            iconColor="text-emerald-600"
            label="完了済(今年)"
            value={`${kpis.completed.count} 件`}
            subText="累計実績"
          />
        </div>

        {/* Filter bar + 2-pane content */}
        <div className="grid flex-1 grid-cols-12 gap-3">
          {/* 左 9: filter + list table */}
          <div className="col-span-12 flex flex-col gap-2 lg:col-span-9">
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
                  placeholder="案件名 / 顧客 / コードで検索"
                  className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-7 pr-2 text-[12px] focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <FilterSelect
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as StatusFilter)}
                label="ステータス"
                options={[
                  { value: "all", label: "全て" },
                  { value: "active", label: "進行中" },
                  { value: "delayed", label: "遅延" },
                  { value: "upcoming", label: "完了予定" },
                  { value: "completed", label: "完了済" },
                ]}
              />
              <FilterSelect
                value={workTypeFilter}
                onChange={(v) => setWorkTypeFilter(v)}
                label="工種"
                options={[
                  { value: "all", label: "全て" },
                  ...workTypes.map((w) => ({ value: w, label: w })),
                ]}
              />
              <FilterSelect
                value={`${sortKey}:${sortDir}`}
                onChange={(v) => {
                  const [k, d] = v.split(":") as [SortKey, SortDir];
                  setSortKey(k);
                  setSortDir(d);
                }}
                label="並び替え"
                options={[
                  { value: "dueAt:asc", label: "期日 近い順" },
                  { value: "dueAt:desc", label: "期日 遠い順" },
                  { value: "startedAt:desc", label: "着手日 新しい順" },
                  { value: "contractYen:desc", label: "金額 高い順" },
                  { value: "progressPct:desc", label: "進捗 高い順" },
                  { value: "name:asc", label: "案件名 あ→ん" },
                ]}
              />
              <div className="text-[11px] text-slate-500">
                全 <span className="font-bold text-slate-900">{filtered.length}</span> /{" "}
                {projects.length} 件
              </div>
            </section>

            {/* Project list table */}
            <section className="flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <caption className="sr-only">案件一覧</caption>
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-2 py-2 text-left font-bold">コード</th>
                      <SortableTh
                        label="案件名"
                        active={sortKey === "name"}
                        dir={sortDir}
                        onClick={() => toggleSort("name")}
                      />
                      <th className="px-2 py-2 text-left font-bold">顧客</th>
                      <th className="px-2 py-2 text-left font-bold">工種</th>
                      <SortableTh
                        label="進捗"
                        active={sortKey === "progressPct"}
                        dir={sortDir}
                        onClick={() => toggleSort("progressPct")}
                        align="left"
                      />
                      <SortableTh
                        label="着手"
                        active={sortKey === "startedAt"}
                        dir={sortDir}
                        onClick={() => toggleSort("startedAt")}
                      />
                      <SortableTh
                        label="期日"
                        active={sortKey === "dueAt"}
                        dir={sortDir}
                        onClick={() => toggleSort("dueAt")}
                      />
                      <SortableTh
                        label="金額"
                        active={sortKey === "contractYen"}
                        dir={sortDir}
                        onClick={() => toggleSort("contractYen")}
                        align="right"
                      />
                      <th className="px-2 py-2 text-center font-bold">ステータス</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((p) => {
                      const isSelected = p.id === selected?.id;
                      const meta = STATUS_META[p.status];
                      return (
                        <tr
                          key={p.id}
                          aria-selected={isSelected}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                          }`}
                          onClick={() => setSelectedId(p.id)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedId(p.id);
                            }
                          }}
                        >
                          <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[10px] text-slate-500">
                            {p.code}
                          </td>
                          <td className="max-w-[180px] truncate px-2 py-1.5 font-bold text-slate-900">
                            {p.name}
                          </td>
                          <td className="max-w-[140px] truncate px-2 py-1.5 text-slate-700">
                            {p.customer}
                          </td>
                          <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">
                            {p.workType}
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-1">
                              <span className="w-7 text-right text-[10px] font-bold tabular-nums text-slate-800">
                                {p.progressPct}%
                              </span>
                              <div className="h-1 w-12 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-blue-600"
                                  style={{ width: `${p.progressPct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-2 py-1.5 text-[10px] text-slate-500">
                            {p.startedAt}
                          </td>
                          <td className="whitespace-nowrap px-2 py-1.5 text-[10px] text-slate-500">
                            {p.dueAt}
                          </td>
                          <td className="whitespace-nowrap px-2 py-1.5 text-right font-bold tabular-nums text-slate-900">
                            ¥{p.contractYen.toLocaleString("ja-JP")}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.pill}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
                                aria-hidden
                              />
                              {meta.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-2 py-8 text-center text-[12px] text-slate-500"
                        >
                          該当する案件がありません。検索条件を変えてください。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* 右 3: detail panel */}
          <aside className="col-span-12 lg:col-span-3">
            {selected ? (
              <ProjectDetailPanel project={selected} canEdit={canEdit} />
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-[12px] text-slate-500">
                案件を選択してください
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

function SortableTh({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      className={`whitespace-nowrap px-2 py-2 font-bold text-${align}`}
      scope="col"
    >
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-0.5 hover:text-slate-900 ${
          active ? "text-blue-700" : ""
        }`}
        aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      >
        {label}
        {active && <span aria-hidden>{dir === "asc" ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}

function ProjectDetailPanel({
  project,
  canEdit,
}: {
  project: ProjectRow;
  canEdit: boolean;
}) {
  const meta = STATUS_META[project.status];
  const delta = project.progressPct - project.plannedPct;

  return (
    <section className="flex flex-col gap-2">
      {/* 案件 header card */}
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-mono text-[10px] text-slate-500">{project.code}</div>
            <h2 className="mt-0.5 text-[14px] font-black leading-tight text-slate-950">
              {project.name}
            </h2>
          </div>
          <span
            className={`inline-flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.pill}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
            {meta.label}
          </span>
        </div>
        <div className="text-[11px] text-slate-600">{project.customer}</div>
        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
          <MapPin className="h-3 w-3" aria-hidden />
          <span className="truncate">{project.address}</span>
        </div>
      </div>

      {/* 進捗 */}
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <h3 className="mb-2 text-[12px] font-black text-slate-950">進捗状況</h3>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>実績</span>
          <span className="text-[16px] font-black text-slate-950">
            {project.progressPct}%
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${project.progressPct}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px]">
          <span className="text-slate-500">予定 {project.plannedPct}%</span>
          <span
            className={`font-bold tabular-nums ${
              delta > 0
                ? "text-emerald-600"
                : delta < 0
                  ? "text-red-600"
                  : "text-slate-500"
            }`}
          >
            {delta > 0 ? `+${delta}%` : delta < 0 ? `${delta}%` : "±0%"}
          </span>
        </div>
      </div>

      {/* 案件情報 */}
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <h3 className="mb-2 text-[12px] font-black text-slate-950">案件情報</h3>
        <dl className="space-y-1.5 text-[11px]">
          <InfoRow
            icon={<HardHat className="h-3.5 w-3.5 text-slate-400" />}
            label="現場リーダー"
            value={project.leader}
          />
          <InfoRow
            icon={<Users className="h-3.5 w-3.5 text-slate-400" />}
            label="作業人数"
            value={`${project.crew} 名`}
          />
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5 text-slate-400" />}
            label="着手日"
            value={project.startedAt}
          />
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5 text-slate-400" />}
            label="期日"
            value={project.dueAt}
          />
          <InfoRow
            icon={<Wallet className="h-3.5 w-3.5 text-slate-400" />}
            label="契約金額"
            value={`¥${project.contractYen.toLocaleString("ja-JP")}`}
          />
        </dl>
      </div>

      {/* クイックアクション */}
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <h3 className="mb-2 text-[12px] font-black text-slate-950">
          クイックアクション
        </h3>
        <div className="flex flex-col gap-1.5">
          <Link
            href="/pc/report3/new"
            className="flex items-center justify-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700 transition-colors hover:bg-blue-100"
          >
            <ClipboardEdit className="h-3.5 w-3.5" aria-hidden />
            REPORT3 入力
          </Link>
          <Link
            href={`/pc/projects/${project.id}`}
            className="flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            案件詳細を見る
          </Link>
          {canEdit && (
            <Link
              href={`/pc/projects/${project.id}`}
              className="flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              編集する
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5 text-slate-500">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <span className="truncate font-bold text-slate-900">{value}</span>
    </div>
  );
}
