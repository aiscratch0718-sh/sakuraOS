"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Printer,
  Search,
  Users,
  UserX,
  Wrench,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { PageHeader } from "@/components/ui";
import type { ProjectRow, ProjectStatus } from "../projects/_data/mock-projects";
import { STATUS_META } from "../projects/_data/mock-projects";

/* ============================================================
   設定 / 定数
   ============================================================ */

/** 工種ごとのアクセントカラー(配置 chip 用) */
const WORK_TYPE_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  給排水工事: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  給湯設備工事: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  排水管工事: { bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500" },
  配管点検工事: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  改修工事: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  ガス配管工事: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

const DEFAULT_WORK_TYPE_COLOR = { bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-500" };

const WORK_TYPES = [
  "給排水工事",
  "給湯設備工事",
  "排水管工事",
  "配管点検工事",
  "改修工事",
  "ガス配管工事",
];

const STATUS_OPTIONS: ProjectStatus[] = ["active", "delayed", "upcoming", "completed"];

/** 週の開始日(2026-05-25 月曜) */
const DEFAULT_WEEK_START = "2026-05-25";

const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

/** 未配置者(モック) */
const UNASSIGNED_MEMBERS = [
  { id: "u1", name: "中村 啓介", role: "配管工", reason: "前現場完了" },
  { id: "u2", name: "山田 太郎", role: "見習い", reason: "新規入社" },
  { id: "u3", name: "森田 健", role: "配管工", reason: "前現場完了" },
];

/* ============================================================
   メインクライアントコンポーネント
   ============================================================ */

export function SchedulesClient({ projects }: { projects: ProjectRow[] }) {
  // フィルター state
  const [searchQuery, setSearchQuery] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState<string>("all");
  const [statusFilters, setStatusFilters] = useState<Record<ProjectStatus, boolean>>({
    active: true,
    delayed: true,
    upcoming: true,
    completed: false, // 完了済はデフォルト非表示
  });
  const [weekStart, setWeekStart] = useState<string>(DEFAULT_WEEK_START);

  // 7日分の日付配列
  const weekDates = useMemo(() => {
    const start = new Date(weekStart);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [weekStart]);

  // フィルター後の案件(週内に進行している案件のみ表示)
  const filteredProjects = useMemo(() => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekStartDate = new Date(weekStart);

    return projects.filter((p) => {
      // 状態フィルター
      if (!statusFilters[p.status]) return false;
      // 工種フィルター
      if (workTypeFilter !== "all" && p.workType !== workTypeFilter) return false;
      // 検索
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!`${p.name} ${p.workType} ${p.leader}`.toLowerCase().includes(q)) return false;
      }
      // 週内に工期が重なっているか
      const pStart = new Date(p.startedAt);
      const pEnd = new Date(p.dueAt);
      return pStart <= weekEnd && pEnd >= weekStartDate;
    });
  }, [projects, statusFilters, workTypeFilter, searchQuery, weekStart]);

  // 週移動
  const moveWeek = (deltaDays: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + deltaDays);
    setWeekStart(formatYmd(d));
  };

  // フィルター toggle
  const toggleStatus = (s: ProjectStatus) => {
    setStatusFilters((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  // 本日(2026-05-28 demo 用)
  const today = useMemo(() => new Date("2026-05-28"), []);

  // 本日のスケジュール(filteredProjects から、本日に進行中の案件)
  const todaysProjects = useMemo(() => {
    return filteredProjects.filter((p) => {
      const s = new Date(p.startedAt);
      const e = new Date(p.dueAt);
      return s <= today && e >= today;
    });
  }, [filteredProjects, today]);

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {/* ヘッダー */}
      <PageHeader
        breadcrumbs={[{ label: "SAKURA OS" }, { label: "スケジュール" }]}
        icon={Calendar}
        title="スケジュール"
        subtitle="人員 / 工程 / 案件のスケジュールを横断で管理できます"
        actions={
          <>
            <button
              type="button"
              onClick={() => moveWeek(-7)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
              aria-label="前の週へ"
            >
              <ChevronLeft className="h-3 w-3" />
              前週
            </button>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
              {formatYmd(weekDates[0]!)} 〜 {formatYmd(weekDates[6]!)}
            </span>
            <button
              type="button"
              onClick={() => moveWeek(7)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
              aria-label="次の週へ"
            >
              次週
              <ChevronRight className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(DEFAULT_WEEK_START)}
              className="rounded-md border border-blue-500 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              今週
            </button>
          </>
        }
      />

      {/* 3-pane layout */}
      <div className="grid grid-cols-12 gap-3">
        {/* 左 panel: フィルター */}
        <FilterPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          workTypeFilter={workTypeFilter}
          onWorkTypeChange={setWorkTypeFilter}
          statusFilters={statusFilters}
          onStatusToggle={toggleStatus}
        />

        {/* 中央 panel: カレンダー */}
        <CalendarPanel
          weekDates={weekDates}
          projects={filteredProjects}
          today={today}
        />

        {/* 右 panel: 本日のスケジュール + 未配置者 */}
        <TodayPanel todaysProjects={todaysProjects} today={today} />
      </div>
    </div>
  );
}

/* ============================================================
   左 panel: フィルター + コスト推移
   ============================================================ */

function FilterPanel({
  searchQuery,
  onSearchChange,
  workTypeFilter,
  onWorkTypeChange,
  statusFilters,
  onStatusToggle,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  workTypeFilter: string;
  onWorkTypeChange: (v: string) => void;
  statusFilters: Record<ProjectStatus, boolean>;
  onStatusToggle: (s: ProjectStatus) => void;
}) {
  return (
    <aside className="col-span-2 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Filter className="h-4 w-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-800">フィルター</h2>
      </div>

      {/* 検索 */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-slate-600">
          検索
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="案件名 / 担当"
            aria-label="検索"
            className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-7 pr-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 工種 */}
      <div>
        <label
          htmlFor="schedule-worktype"
          className="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-600"
        >
          <Wrench className="h-3 w-3" />
          工種
        </label>
        <select
          id="schedule-worktype"
          value={workTypeFilter}
          onChange={(e) => onWorkTypeChange(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">すべて</option>
          {WORK_TYPES.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      {/* 状態 checkbox */}
      <fieldset>
        <legend className="mb-1.5 text-[11px] font-medium text-slate-600">
          表示する状態
        </legend>
        <div className="flex flex-col gap-1.5">
          {STATUS_OPTIONS.map((s) => {
            const meta = STATUS_META[s];
            return (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2 text-xs text-slate-700 hover:text-slate-900"
              >
                <input
                  type="checkbox"
                  checked={statusFilters[s]}
                  onChange={() => onStatusToggle(s)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  aria-label={`状態: ${meta.label}`}
                />
                <span
                  className={`h-2 w-2 flex-shrink-0 rounded-full ${meta.dot}`}
                  aria-hidden
                />
                <span>{meta.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* 工種凡例 */}
      <div className="border-t border-slate-100 pt-2">
        <div className="mb-1.5 text-[11px] font-medium text-slate-600">工種凡例</div>
        <ul className="flex flex-col gap-1">
          {WORK_TYPES.map((w) => {
            const c = WORK_TYPE_COLOR[w] ?? DEFAULT_WORK_TYPE_COLOR;
            return (
              <li key={w} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} aria-hidden />
                <span className="truncate">{w}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* チームコスト mini stats */}
      <div className="mt-auto rounded-md border border-slate-200 bg-slate-50 p-2">
        <div className="mb-1 text-[10px] font-medium text-slate-500">
          チームコスト推移
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] text-slate-700">入社</span>
          <span className="text-[13px] font-semibold text-blue-600">68%</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-[11px] text-slate-700">出勤率</span>
          <span className="text-[13px] font-semibold text-emerald-600">92%</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-[11px] text-slate-700">残業率</span>
          <span className="text-[13px] font-semibold text-amber-600">8%</span>
        </div>
      </div>
    </aside>
  );
}

/* ============================================================
   中央 panel: カレンダー(案件 × 週ビュー)
   ============================================================ */

function CalendarPanel({
  weekDates,
  projects,
  today,
}: {
  weekDates: Date[];
  projects: ProjectRow[];
  today: Date;
}) {
  return (
    <section className="col-span-7 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between border-b border-slate-100 p-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Calendar className="h-3.5 w-3.5" />
          <span className="font-medium">案件 × 週ビュー</span>
          <span className="text-slate-400">({projects.length} 件)</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <span>セルクリックで配置詳細</span>
        </div>
      </div>

      {/* テーブル */}
      <div className="flex-1 overflow-auto">
        <table className="w-full table-fixed text-xs">
          <colgroup>
            <col style={{ width: "180px" }} />
            {weekDates.map((d) => (
              <col key={d.toISOString()} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              <th
                scope="col"
                className="border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-medium text-slate-700"
              >
                チーム / 案件
              </th>
              {weekDates.map((d) => {
                const isToday = isSameDay(d, today);
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <th
                    scope="col"
                    key={d.toISOString()}
                    className={`border-b border-l border-slate-200 px-1 py-1.5 text-center text-[11px] ${
                      isToday
                        ? "bg-blue-50 font-semibold text-blue-700"
                        : isWeekend
                          ? "bg-slate-100 text-slate-600"
                          : "font-medium text-slate-700"
                    }`}
                  >
                    <div>{`${d.getMonth() + 1}/${d.getDate()}`}</div>
                    <div className="text-[9px] font-normal text-slate-500">
                      {WEEKDAY_LABELS[(d.getDay() + 6) % 7]}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={weekDates.length + 1}
                  className="px-3 py-6 text-center text-xs text-slate-500"
                >
                  該当する案件がありません
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <ProjectRow_ key={p.id} project={p} weekDates={weekDates} today={today} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* フッター: 凡例 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 bg-slate-50 px-2 py-1.5 text-[10px] text-slate-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-blue-100 ring-1 ring-blue-200" />
          配置あり
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-slate-100 ring-1 ring-slate-200" />
          工期外
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-blue-50 ring-1 ring-blue-300" />
          本日
        </span>
        <span className="ml-auto">期間: 2026-05-25 〜 2026-05-31</span>
      </div>
    </section>
  );
}

function ProjectRow_({
  project,
  weekDates,
  today,
}: {
  project: ProjectRow;
  weekDates: Date[];
  today: Date;
}) {
  const meta = STATUS_META[project.status];
  const workColor = WORK_TYPE_COLOR[project.workType] ?? DEFAULT_WORK_TYPE_COLOR;
  const pStart = new Date(project.startedAt);
  const pEnd = new Date(project.dueAt);

  return (
    <tr className="hover:bg-slate-50">
      {/* 案件名セル */}
      <th
        scope="row"
        className="border-b border-slate-100 bg-white px-2 py-1.5 text-left align-top"
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${workColor.dot}`} aria-hidden />
            <span className="truncate text-[11px] font-medium text-slate-800">
              {project.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`rounded-full px-1.5 py-px text-[9px] font-medium ${meta.pill}`}
            >
              {meta.label}
            </span>
            <span className="truncate text-[9px] text-slate-500">
              {project.workType}
            </span>
          </div>
          <div className="text-[9px] text-slate-500">
            {project.leader} / 計 {project.crew} 名
          </div>
        </div>
      </th>

      {/* 日付セル × 7 */}
      {weekDates.map((d) => {
        const isInRange = d >= pStart && d <= pEnd;
        const isToday = isSameDay(d, today);
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        const assignment = isInRange
          ? generateMockAssignment(project, d)
          : null;

        return (
          <td
            key={d.toISOString()}
            className={`border-b border-l border-slate-100 align-top ${
              isToday
                ? "bg-blue-50/40"
                : isWeekend
                  ? "bg-slate-50/50"
                  : ""
            }`}
          >
            {assignment ? (
              <button
                type="button"
                aria-label={`${project.name} ${d.getMonth() + 1}/${d.getDate()} の配置 ${assignment.count}名`}
                className={`flex w-full flex-col items-start gap-0.5 rounded-sm px-1.5 py-1 text-left transition-colors hover:brightness-95 ${workColor.bg}`}
              >
                <span className={`text-[9px] font-medium ${workColor.text} truncate w-full`}>
                  {assignment.subType}
                </span>
                <div className="flex w-full items-center justify-between">
                  <span className="text-[9px] text-slate-500">
                    {`${d.getMonth() + 1}/${d.getDate()}`}
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full bg-white px-1 py-px text-[9px] font-semibold ${workColor.text}`}
                  >
                    <Users className="h-2 w-2" />
                    {assignment.count}名
                  </span>
                </div>
              </button>
            ) : (
              <div className="h-full min-h-[36px]" aria-hidden />
            )}
          </td>
        );
      })}
    </tr>
  );
}

/* ============================================================
   右 panel: 本日のスケジュール + 未配置者
   ============================================================ */

function TodayPanel({
  todaysProjects,
  today,
}: {
  todaysProjects: ProjectRow[];
  today: Date;
}) {
  const totalAssigned = todaysProjects.reduce((sum, p) => sum + Math.min(p.crew, 5), 0);

  return (
    <aside className="col-span-3 flex flex-col gap-3">
      {/* 本日のスケジュール */}
      <section className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            本日のスケジュール
          </h2>
          <span className="text-[10px] text-slate-500">
            {today.getMonth() + 1}/{today.getDate()}
          </span>
        </div>

        {/* 当日 KPI */}
        <div className="mb-2 grid grid-cols-3 gap-1.5">
          <MiniKpi label="現場" value={todaysProjects.length} accent="text-blue-600" />
          <MiniKpi label="人員" value={totalAssigned} accent="text-emerald-600" />
          <MiniKpi label="未配置" value={UNASSIGNED_MEMBERS.length} accent="text-rose-600" />
        </div>

        {/* 当日案件リスト */}
        <ul className="flex flex-col gap-1.5">
          {todaysProjects.length === 0 ? (
            <li className="rounded-md bg-slate-50 px-2 py-3 text-center text-[11px] text-slate-500">
              本日の案件はありません
            </li>
          ) : (
            todaysProjects.slice(0, 4).map((p) => {
              const meta = STATUS_META[p.status];
              const c = WORK_TYPE_COLOR[p.workType] ?? DEFAULT_WORK_TYPE_COLOR;
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5"
                >
                  <span className={`h-2 w-2 flex-shrink-0 rounded-full ${c.dot}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium text-slate-800">
                      {p.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`rounded-full px-1 py-px text-[8px] font-medium ${meta.pill}`}>
                        {meta.label}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {p.leader} / {Math.min(p.crew, 5)}名
                      </span>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>

      {/* 未配置者 */}
      <section className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <UserX className="h-3.5 w-3.5 text-rose-600" />
            未配置者
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700">
            <AlertTriangle className="h-2.5 w-2.5" />
            {UNASSIGNED_MEMBERS.length} 名
          </span>
        </div>
        <ul className="flex flex-col gap-1.5">
          {UNASSIGNED_MEMBERS.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-2 rounded-md border border-rose-100 bg-rose-50/40 px-2 py-1.5"
            >
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-semibold text-rose-700"
                aria-hidden
              >
                {m.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-medium text-slate-800">
                  {m.name}
                </div>
                <div className="truncate text-[9px] text-slate-500">
                  {m.role} / {m.reason}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* アクション: 印刷 + 配置ボード */}
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Printer className="h-3.5 w-3.5" />
          人員表を印刷
        </button>
        <Link
          href="/pc/dispatch-map"
          className="flex items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          配置マップへ
        </Link>
      </div>
    </aside>
  );
}

function MiniKpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50 px-1.5 py-1 text-center">
      <div className={`text-[15px] font-bold leading-none ${accent}`}>{value}</div>
      <div className="mt-0.5 text-[9px] text-slate-500">{label}</div>
    </div>
  );
}

/* ============================================================
   ヘルパー
   ============================================================ */

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** モック配置生成: 案件 + 日付から擬似的に subType / count を生成 */
function generateMockAssignment(
  project: ProjectRow,
  date: Date,
): { subType: string; count: number } | null {
  // 週末は配置なし(土日)
  if (date.getDay() === 0 || date.getDay() === 6) return null;

  // 工種に対応する subType
  const subTypeMap: Record<string, string[]> = {
    給排水工事: ["給水管布設", "排水接続", "継手作業"],
    給湯設備工事: ["給湯配管", "ボイラー設置", "保温工事"],
    排水管工事: ["管路掘削", "管渠敷設", "復旧作業"],
    配管点検工事: ["点検作業", "圧力試験", "報告書作成"],
    改修工事: ["既設撤去", "新設配管", "復旧工事"],
    ガス配管工事: ["ガス管敷設", "気密試験", "接続作業"],
  };
  const subTypes = subTypeMap[project.workType] ?? ["作業"];

  // project.id + date.getDate() から決定的に選択
  const idNum = parseInt(project.id.replace(/\D/g, ""), 10) || 1;
  const dayNum = date.getDate();
  const subType = subTypes[(idNum + dayNum) % subTypes.length] ?? subTypes[0]!;
  const count = Math.max(2, Math.min(project.crew, 3 + ((idNum + dayNum) % Math.max(1, project.crew - 2))));

  return { subType, count };
}
