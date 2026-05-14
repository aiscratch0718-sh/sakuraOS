"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Calendar,
  MapPin,
  Wrench,
  Filter,
  X,
  Map as MapIcon,
  List,
  Users,
  Building2,
  ClipboardList,
  FileText,
  TrendingUp,
} from "lucide-react";
import type { ProjectRow, ProjectStatus } from "../projects/_data/mock-projects";
import { STATUS_META } from "../projects/_data/mock-projects";

/* ============================================================
   設定 / 定数
   ============================================================ */

/** マップピン色(状態に基づく) */
const PIN_COLOR_BY_STATUS: Record<ProjectStatus, string> = {
  active: "#2563eb", // 青(進行中)
  delayed: "#ef4444", // 赤(遅延)
  upcoming: "#f59e0b", // 橙(完了予定)
  completed: "#10b981", // 緑(完了済)
};

const WORK_TYPES = [
  "給排水工事",
  "給湯設備工事",
  "排水管工事",
  "配管点検工事",
  "改修工事",
  "ガス配管工事",
];

const STATUS_OPTIONS: ProjectStatus[] = ["active", "delayed", "upcoming", "completed"];

const DEFAULT_DATE = "2026-05-14";

/* ============================================================
   メインクライアントコンポーネント
   ============================================================ */

export function DispatchMapClient({ projects }: { projects: ProjectRow[] }) {
  // 検索 / フィルター state
  const [searchQuery, setSearchQuery] = useState("");
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState(DEFAULT_DATE);
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [workTypeFilter, setWorkTypeFilter] = useState<string>("all");
  const [statusFilters, setStatusFilters] = useState<Record<ProjectStatus, boolean>>({
    active: true,
    delayed: true,
    upcoming: true,
    completed: true,
  });
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedId, setSelectedId] = useState<string>(projects[0]?.id ?? "");

  // エリアオプション(住所先頭の市町村を抽出)
  const areaOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      // 「宮城県仙台市青葉区...」→「仙台市」or「黒川郡大和町」抽出
      const m =
        p.address.match(/宮城県([^市町村郡]+(?:市|町|村))/) ??
        p.address.match(/宮城県([^市町村]+郡[^市町村]+(?:町|村))/);
      if (m && m[1]) set.add(m[1]);
    }
    return Array.from(set).sort();
  }, [projects]);

  // フィルター適用
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // 状態フィルター(checkbox)
      if (!statusFilters[p.status]) return false;

      // 工種フィルター
      if (workTypeFilter !== "all" && p.workType !== workTypeFilter) return false;

      // エリアフィルター(住所内に market/town 文字列を含むか)
      if (areaFilter !== "all" && !p.address.includes(areaFilter)) return false;

      // クイック検索(案件名 / 顧客名 / 工種 / コード)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const haystack = `${p.name} ${p.customer} ${p.workType} ${p.code}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // マップ上部の検索(案件名・住所)
      if (mapSearchQuery) {
        const q = mapSearchQuery.toLowerCase();
        const haystack = `${p.name} ${p.address}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [projects, statusFilters, workTypeFilter, areaFilter, searchQuery, mapSearchQuery]);

  // 選択中の案件(filteredProjects に含まれない場合は先頭に切替)
  const selected = useMemo(() => {
    return (
      filteredProjects.find((p) => p.id === selectedId) ??
      filteredProjects[0] ??
      null
    );
  }, [filteredProjects, selectedId]);

  // マップ iframe URL(選択案件があれば lat/lng & z=14、無ければ宮城県中心 & z=9)
  const mapUrl = useMemo(() => {
    if (selected) {
      return `https://maps.google.com/maps?q=${selected.lat},${selected.lng}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    }
    return `https://maps.google.com/maps?q=38.27,140.95&t=&z=9&ie=UTF8&iwloc=&output=embed`;
  }, [selected]);

  // フィルタークリア
  const clearFilters = () => {
    setSearchQuery("");
    setMapSearchQuery("");
    setDateFilter(DEFAULT_DATE);
    setAreaFilter("all");
    setWorkTypeFilter("all");
    setStatusFilters({ active: true, delayed: true, upcoming: true, completed: true });
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    mapSearchQuery !== "" ||
    areaFilter !== "all" ||
    workTypeFilter !== "all" ||
    Object.values(statusFilters).some((v) => !v);

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {/* ヘッダー */}
      <header className="flex items-center justify-between">
        <div>
          <nav className="text-[11px] text-slate-500" aria-label="パンくず">
            <span>SAKURA OS</span>
            <span className="mx-1">/</span>
            <span className="font-medium text-slate-700">配置マップ</span>
          </nav>
          <h1 className="mt-0.5 flex items-center gap-2 text-base font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-blue-600" />
            配置マップ
            <span className="text-xs font-normal text-slate-500">
              現場の位置情報と当日配置人員をマップで確認できます
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>絞込結果: {filteredProjects.length} 件</span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
              <X className="h-3 w-3" />
              絞り込みをクリア
            </button>
          )}
        </div>
      </header>

      {/* 3-pane layout(grid 12 col) */}
      <div className="grid grid-cols-12 gap-3">
        {/* === 左 panel: フィルター === */}
        <FilterPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          areaOptions={areaOptions}
          areaFilter={areaFilter}
          onAreaChange={setAreaFilter}
          workTypeFilter={workTypeFilter}
          onWorkTypeChange={setWorkTypeFilter}
          statusFilters={statusFilters}
          onStatusToggle={(s) =>
            setStatusFilters((prev) => ({ ...prev, [s]: !prev[s] }))
          }
          onClear={clearFilters}
          totalCount={projects.length}
          filteredCount={filteredProjects.length}
        />

        {/* === 中央 panel: マップ === */}
        <MapPanel
          mapUrl={mapUrl}
          mapSearchQuery={mapSearchQuery}
          onMapSearchChange={setMapSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filteredProjects={filteredProjects}
          selectedId={selected?.id ?? ""}
          onSelect={setSelectedId}
        />

        {/* === 右 panel: 選択案件詳細 === */}
        <DetailPanel project={selected} />
      </div>
    </div>
  );
}

/* ============================================================
   左 panel: フィルター
   ============================================================ */

function FilterPanel({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateChange,
  areaOptions,
  areaFilter,
  onAreaChange,
  workTypeFilter,
  onWorkTypeChange,
  statusFilters,
  onStatusToggle,
  onClear,
  totalCount,
  filteredCount,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  dateFilter: string;
  onDateChange: (v: string) => void;
  areaOptions: string[];
  areaFilter: string;
  onAreaChange: (v: string) => void;
  workTypeFilter: string;
  onWorkTypeChange: (v: string) => void;
  statusFilters: Record<ProjectStatus, boolean>;
  onStatusToggle: (s: ProjectStatus) => void;
  onClear: () => void;
  totalCount: number;
  filteredCount: number;
}) {
  return (
    <aside className="col-span-3 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Filter className="h-4 w-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-800">フィルター</h2>
      </div>

      {/* クイック検索 */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-slate-600">
          クイック検索
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="案件名、顧客で検索"
            aria-label="案件検索"
            className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-7 pr-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 日付 */}
      <div>
        <label
          htmlFor="date-filter"
          className="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-600"
        >
          <Calendar className="h-3 w-3" />
          対象日
        </label>
        <input
          id="date-filter"
          type="date"
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* エリア */}
      <div>
        <label
          htmlFor="area-filter"
          className="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-600"
        >
          <MapPin className="h-3 w-3" />
          エリア
        </label>
        <select
          id="area-filter"
          value={areaFilter}
          onChange={(e) => onAreaChange(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">すべて</option>
          {areaOptions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* 工種 */}
      <div>
        <label
          htmlFor="worktype-filter"
          className="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-600"
        >
          <Wrench className="h-3 w-3" />
          工種
        </label>
        <select
          id="worktype-filter"
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

      {/* 状態 checkbox group */}
      <fieldset>
        <legend className="mb-1.5 text-[11px] font-medium text-slate-600">状態</legend>
        <div className="flex flex-col gap-1.5">
          {STATUS_OPTIONS.map((s) => {
            const meta = STATUS_META[s];
            const checked = statusFilters[s];
            return (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2 text-xs text-slate-700 hover:text-slate-900"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onStatusToggle(s)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  aria-label={`状態: ${meta.label}`}
                />
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: PIN_COLOR_BY_STATUS[s] }}
                  aria-hidden
                />
                <span>{meta.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* チーム稼働状況 mini stats */}
      <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
        <div className="mb-1 text-[10px] font-medium text-slate-500">
          チーム稼働状況
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] text-slate-700">出勤率</span>
          <span className="text-[15px] font-bold text-blue-600">85%</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-[11px] text-slate-700">稼働中</span>
          <span className="text-[13px] font-semibold text-emerald-600">92%</span>
        </div>
      </div>

      {/* 絞り込むボタン(視覚的アクション、フィルターはリアルタイム反映済) */}
      <button
        type="button"
        onClick={onClear}
        className="mt-auto w-full rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        aria-label="絞り込みをクリア"
      >
        絞り込みをクリア({totalCount - filteredCount}件 hidden)
      </button>
    </aside>
  );
}

/* ============================================================
   中央 panel: マップ
   ============================================================ */

function MapPanel({
  mapUrl,
  mapSearchQuery,
  onMapSearchChange,
  viewMode,
  onViewModeChange,
  filteredProjects,
  selectedId,
  onSelect,
}: {
  mapUrl: string;
  mapSearchQuery: string;
  onMapSearchChange: (v: string) => void;
  viewMode: "map" | "list";
  onViewModeChange: (v: "map" | "list") => void;
  filteredProjects: ProjectRow[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="col-span-6 flex flex-col rounded-lg border border-slate-200 bg-white">
      {/* マップヘッダー */}
      <div className="flex items-center gap-2 border-b border-slate-100 p-2">
        {/* 表示モード切替 */}
        <div
          role="tablist"
          aria-label="表示モード切替"
          className="flex rounded-md border border-slate-300 bg-slate-50 p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "map"}
            onClick={() => onViewModeChange("map")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
              viewMode === "map"
                ? "bg-white font-medium text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MapIcon className="h-3 w-3" />
            地図
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "list"}
            onClick={() => onViewModeChange("list")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
              viewMode === "list"
                ? "bg-white font-medium text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List className="h-3 w-3" />
            リスト
          </button>
        </div>

        {/* 上部検索 */}
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={mapSearchQuery}
            onChange={(e) => onMapSearchChange(e.target.value)}
            placeholder="この場所で検索: 現場名・住所"
            aria-label="マップ検索"
            className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-7 pr-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <span className="whitespace-nowrap text-[11px] text-slate-500">
          {filteredProjects.length} 件
        </span>
      </div>

      {/* マップ本体 or リスト */}
      {viewMode === "map" ? (
        <div className="relative flex-1 overflow-hidden">
          <iframe
            title="配置マップ(宮城県)"
            src={mapUrl}
            className="h-[460px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* マップ上のピン凡例 (overlay 右上) */}
          <div className="pointer-events-none absolute right-2 top-2 rounded-md border border-slate-200 bg-white/90 p-2 text-[10px] shadow-sm">
            <div className="mb-1 font-semibold text-slate-700">凡例</div>
            <div className="flex flex-col gap-0.5">
              {STATUS_OPTIONS.map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: PIN_COLOR_BY_STATUS[s] }}
                    aria-hidden
                  />
                  <span className="text-slate-600">{STATUS_META[s].label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <ul className="h-[460px] overflow-y-auto divide-y divide-slate-100">
          {filteredProjects.length === 0 ? (
            <li className="p-6 text-center text-xs text-slate-500">
              該当する案件はありません
            </li>
          ) : (
            filteredProjects.map((p) => {
              const isActive = p.id === selectedId;
              const meta = STATUS_META[p.status];
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(p.id)}
                    aria-current={isActive ? "true" : undefined}
                    aria-selected={isActive}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors ${
                      isActive ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: PIN_COLOR_BY_STATUS[p.status] }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-medium text-slate-800">
                          {p.name}
                        </span>
                        <span
                          className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-medium ${meta.pill}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-[10px] text-slate-500">
                        {p.workType} / {p.address}
                      </div>
                    </div>
                    <span className="whitespace-nowrap text-[10px] text-slate-600">
                      {p.crew}名
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}

      {/* マップ下の選択中ピンリスト(quick navigation) */}
      {viewMode === "map" && (
        <div className="border-t border-slate-100 p-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-600">
              表示中の現場 ({filteredProjects.length} 件)
            </span>
            <span className="text-[10px] text-slate-500">
              クリックでピンに移動
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {filteredProjects.slice(0, 8).map((p) => {
              const isActive = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelect(p.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-colors ${
                    isActive
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: PIN_COLOR_BY_STATUS[p.status] }}
                    aria-hidden
                  />
                  <span className="max-w-[120px] truncate">{p.name}</span>
                </button>
              );
            })}
            {filteredProjects.length > 8 && (
              <span className="px-2 py-0.5 text-[10px] text-slate-500">
                +{filteredProjects.length - 8} 件
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ============================================================
   右 panel: 選択案件詳細
   ============================================================ */

function DetailPanel({ project }: { project: ProjectRow | null }) {
  if (!project) {
    return (
      <aside className="col-span-3 flex h-[520px] items-center justify-center rounded-lg border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
        フィルターに該当する案件がありません
      </aside>
    );
  }

  const meta = STATUS_META[project.status];
  const pinColor = PIN_COLOR_BY_STATUS[project.status];

  // 配置作業員のモック(crew 数からアバター生成)
  const assignedMembers = generateMockMembers(project);

  return (
    <aside className="col-span-3 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3">
      {/* Header */}
      <div className="border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" style={{ color: pinColor }} />
          <span className="text-[10px] font-mono text-slate-500">{project.code}</span>
          <span
            className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.pill}`}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: pinColor }}
              aria-hidden
            />
            {meta.label}
          </span>
        </div>
        <h3 className="mt-1 text-sm font-semibold leading-tight text-slate-900">
          {project.name}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
          <Wrench className="h-3 w-3" />
          {project.workType}
        </div>
      </div>

      {/* 配置作業員 */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
            <Users className="h-3 w-3" />
            配置作業員
          </span>
          <span className="text-[11px] font-semibold text-blue-600">
            {assignedMembers.length} / {project.crew} 名
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {assignedMembers.slice(0, 4).map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-1"
            >
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                style={{ backgroundColor: m.color }}
                aria-hidden
              >
                {m.initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-medium text-slate-800">
                  {m.name}
                </div>
                <div className="truncate text-[9px] text-slate-500">{m.role}</div>
              </div>
              {m.isLeader && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-medium text-amber-700">
                  リーダー
                </span>
              )}
            </div>
          ))}
          {assignedMembers.length > 4 && (
            <div className="px-2 text-[10px] text-slate-500">
              +{assignedMembers.length - 4} 名
            </div>
          )}
        </div>
      </div>

      {/* 案件情報 */}
      <div className="rounded-md border border-slate-100 bg-slate-50 p-2">
        <InfoRow label="受注金額" value={`¥${project.contractYen.toLocaleString()}`} />
        <InfoRow label="工期" value={`${project.startedAt} 〜 ${project.dueAt}`} />
        <InfoRow label="進捗" value={`${project.progressPct}% / 予定 ${project.plannedPct}%`} />
        <InfoRow label="現場リーダー" value={project.leader} />
        <InfoRow
          label="住所"
          value={project.address.replace(/^宮城県/, "")}
        />
      </div>

      {/* 進捗バー */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-700">進捗率</span>
          <span className="text-[11px] font-semibold text-slate-800">
            {project.progressPct}%
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={project.progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`進捗率 ${project.progressPct}%`}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${project.progressPct}%`,
              backgroundColor: pinColor,
            }}
          />
        </div>
        <div className="mt-0.5 flex items-center justify-between text-[9px] text-slate-500">
          <span>0%</span>
          <span className="flex items-center gap-0.5">
            <TrendingUp className="h-2.5 w-2.5" />
            予定 {project.plannedPct}%
          </span>
          <span>100%</span>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="mt-auto flex flex-col gap-1.5 border-t border-slate-100 pt-2">
        <Link
          href={`/pc/report3/new?project=${project.id}`}
          className="flex items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          今日のレポートを見る
        </Link>
        <Link
          href={`/pc/projects?selected=${project.id}`}
          className="flex items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <FileText className="h-3.5 w-3.5" />
          案件詳細へ
        </Link>
      </div>
    </aside>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5 text-[11px]">
      <span className="flex-shrink-0 text-slate-500">{label}</span>
      <span className="truncate text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}

/* ============================================================
   ヘルパー: モック配置作業員生成
   ============================================================ */

type MockMember = {
  id: string;
  name: string;
  role: string;
  initial: string;
  color: string;
  isLeader: boolean;
};

const MEMBER_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444"];

const MEMBER_POOL = [
  { name: "田中 一郎", role: "現場主任" },
  { name: "鈴木 健太", role: "配管工" },
  { name: "高橋 健", role: "配管工" },
  { name: "伊藤 翔太", role: "見習い" },
  { name: "山本 直樹", role: "配管工" },
  { name: "佐藤 一郎", role: "配管工" },
  { name: "渡辺 直也", role: "現場主任" },
  { name: "中村 啓介", role: "配管工" },
  { name: "斎藤 拓也", role: "見習い" },
  { name: "加藤 翔", role: "配管工" },
];

function generateMockMembers(project: ProjectRow): MockMember[] {
  // crew 数 + リーダー名を元にした安定的なモック生成
  const count = Math.min(project.crew, 5); // 最大 5 名表示
  const members: MockMember[] = [];

  // 1人目はプロジェクトのリーダー
  members.push({
    id: `${project.id}-leader`,
    name: project.leader,
    role: "現場リーダー",
    initial: project.leader.charAt(0),
    color: PIN_COLOR_BY_STATUS[project.status] ?? "#3b82f6",
    isLeader: true,
  });

  // 残り (count - 1) 名は POOL からプロジェクト ID hash で選択
  for (let i = 1; i < count; i++) {
    const idx = (parseInt(project.id.replace(/\D/g, ""), 10) + i) % MEMBER_POOL.length;
    const m = MEMBER_POOL[idx];
    if (!m) continue;
    if (m.name === project.leader) continue; // 重複回避
    members.push({
      id: `${project.id}-m${i}`,
      name: m.name,
      role: m.role,
      initial: m.name.charAt(0),
      color: MEMBER_COLORS[i % MEMBER_COLORS.length] ?? "#3b82f6",
      isLeader: false,
    });
  }

  return members;
}
