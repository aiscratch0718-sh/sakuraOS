"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Building2,
  Calendar,
  User,
  Wrench,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { MetricCard, CardSection, PageHeader } from "@/components/ui";
import type { ProjectRow } from "../projects/_data/mock-projects";
import { STATUS_META } from "../projects/_data/mock-projects";

/* ============================================================
   設定 / 定数
   ============================================================ */

/** 工種別原価率(原価管理画面と共通の数値) */
const COST_RATE_BY_WORKTYPE: Record<string, number> = {
  給排水工事: 0.62,
  給湯設備工事: 0.58,
  排水管工事: 0.65,
  配管点検工事: 0.45,
  改修工事: 0.7,
  ガス配管工事: 0.6,
};

const DEFAULT_COST_RATE = 0.65;

const MONTHS_12 = [
  "2025/06",
  "2025/07",
  "2025/08",
  "2025/09",
  "2025/10",
  "2025/11",
  "2025/12",
  "2026/01",
  "2026/02",
  "2026/03",
  "2026/04",
  "2026/05",
];

const PAGE_SIZE = 8;

/* ============================================================
   純粋関数
   ============================================================ */

type CostMetrics = {
  revenue: number;
  cost: number;
  profit: number;
  marginPct: number;
};

/** 1 案件 → 売上 / 原価 / 利益 / 利益率 */
function deriveCostMetrics(project: ProjectRow): CostMetrics {
  const costRate = COST_RATE_BY_WORKTYPE[project.workType] ?? DEFAULT_COST_RATE;
  const revenue = Math.floor(project.contractYen * (project.progressPct / 100));
  const cost = Math.floor(revenue * costRate);
  const profit = revenue - cost;
  const marginPct = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;
  return { revenue, cost, profit, marginPct };
}

/** 月次データ(全 12 ヶ月、山なり分配) */
function generateMonthlyData(
  projects: ProjectRow[],
  months: string[],
): Array<{ month: string; revenue: number; cost: number; profit: number }> {
  return months.map((m, idx) => {
    const result = projects.reduce(
      (acc, p) => {
        const metrics = deriveCostMetrics(p);
        const idNum = parseInt(p.id.replace(/\D/g, ""), 10) || 1;
        const variance = 0.6 + 0.8 * Math.abs(Math.sin((idx + idNum) * 0.7));
        return {
          revenue: acc.revenue + Math.floor((metrics.revenue / 12) * variance),
          cost: acc.cost + Math.floor((metrics.cost / 12) * variance),
        };
      },
      { revenue: 0, cost: 0 },
    );
    return {
      month: m,
      revenue: result.revenue,
      cost: result.cost,
      profit: result.revenue - result.cost,
    };
  });
}

/* ============================================================
   メインコンポーネント
   ============================================================ */

export function GaikyoClient({ projects }: { projects: ProjectRow[] }) {
  const [periodLabel, setPeriodLabel] = useState("2025/06 〜 2026/05");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string>(projects[0]?.id ?? "");

  // 案件別 metrics
  const projectMetrics = useMemo(
    () =>
      projects.map((p) => ({
        project: p,
        ...deriveCostMetrics(p),
      })),
    [projects],
  );

  // 全体集計(累計)
  const totals = useMemo(() => {
    const revenue = projectMetrics.reduce((s, m) => s + m.revenue, 0);
    const cost = projectMetrics.reduce((s, m) => s + m.cost, 0);
    const profit = revenue - cost;
    const marginPct = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;
    return { revenue, cost, profit, marginPct };
  }, [projectMetrics]);

  // 月次データ
  const monthlyData = useMemo(
    () => generateMonthlyData(projects, MONTHS_12),
    [projects],
  );

  // 案件別 table(売上降順)
  const sortedRows = useMemo(
    () => [...projectMetrics].sort((a, b) => b.revenue - a.revenue),
    [projectMetrics],
  );

  // ページネーション
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const pagedRows = sortedRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // 選択中案件
  const selected = useMemo(
    () => projectMetrics.find((m) => m.project.id === selectedId) ?? projectMetrics[0]!,
    [projectMetrics, selectedId],
  );

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {/* ヘッダー */}
      <PageHeader
        breadcrumbs={[{ label: "SAKURA OS" }, { label: "工事概況表" }]}
        icon={ClipboardList}
        title="工事概況表"
        subtitle="全社の売上・原価・利益・進捗を月次で集計します"
        actions={
          <>
            <select
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
              aria-label="集計期間"
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option>2025/06 〜 2026/05</option>
              <option>2026 年度</option>
              <option>2025 年度</option>
              <option>四半期</option>
            </select>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              CSV 出力
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-3.5 w-3.5" />
              印刷
            </button>
          </>
        }
      />

      {/* KPI 4 cards */}
      <div className="grid grid-cols-4 gap-3">
        <MetricCard
          label="売上(累計)"
          value={`¥${totals.revenue.toLocaleString()}`}
          subText={periodLabel}
          icon={DollarSign}
          accent="border-l-blue-500"
          iconColor="text-blue-600"
        />
        <MetricCard
          label="原価(累計)"
          value={`¥${totals.cost.toLocaleString()}`}
          subText={`原価率 ${((totals.cost / Math.max(1, totals.revenue)) * 100).toFixed(1)}%`}
          icon={TrendingDown}
          accent="border-l-amber-500"
          iconColor="text-amber-600"
        />
        <MetricCard
          label="利益額"
          value={`¥${totals.profit.toLocaleString()}`}
          subText={`${projectMetrics.filter((m) => m.profit > 0).length} 案件で利益計上`}
          icon={TrendingUp}
          accent="border-l-emerald-500"
          iconColor="text-emerald-600"
        />
        <ProfitMarginKpi marginPct={totals.marginPct} />
      </div>

      {/* メイン 2 列: 中央(chart + table) / 右(選択案件詳細) */}
      <div className="grid grid-cols-12 gap-3">
        {/* === 中央 === */}
        <section className="col-span-9 flex flex-col gap-3">
          {/* 月別 chart */}
          <CardSection title="月別 売上・原価・利益(直近 12 ヶ月)" icon={BarChart3}>
            <MonthlyBarChart data={monthlyData} />
          </CardSection>

          {/* 案件別 table */}
          <CardSection title="案件別 工事概況" icon={Building2}>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-xs">
                <colgroup>
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "13%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-600">
                    <th scope="col" className="px-2 py-1.5 text-left font-medium">現場名</th>
                    <th scope="col" className="px-2 py-1.5 text-left font-medium">顧客</th>
                    <th scope="col" className="px-2 py-1.5 text-left font-medium">工種</th>
                    <th scope="col" className="px-2 py-1.5 text-right font-medium">売上</th>
                    <th scope="col" className="px-2 py-1.5 text-right font-medium">原価</th>
                    <th scope="col" className="px-2 py-1.5 text-right font-medium">利益</th>
                    <th scope="col" className="px-2 py-1.5 text-left font-medium">利益率 / 状態</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row) => {
                    const meta = STATUS_META[row.project.status];
                    const isActive = row.project.id === selected.project.id;
                    return (
                      <tr
                        key={row.project.id}
                        onClick={() => setSelectedId(row.project.id)}
                        aria-current={isActive ? "true" : undefined}
                        aria-selected={isActive}
                        className={`cursor-pointer border-b border-slate-100 transition-colors ${
                          isActive ? "bg-blue-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-2 py-1.5">
                          <div className="truncate font-medium text-slate-800">{row.project.name}</div>
                          <div className="text-[10px] text-slate-500">{row.project.code}</div>
                        </td>
                        <td className="px-2 py-1.5 truncate text-slate-700">{row.project.customer}</td>
                        <td className="px-2 py-1.5 text-slate-700">{row.project.workType}</td>
                        <td className="px-2 py-1.5 text-right font-medium text-slate-900">
                          ¥{row.revenue.toLocaleString()}
                        </td>
                        <td className="px-2 py-1.5 text-right text-amber-700">
                          ¥{row.cost.toLocaleString()}
                        </td>
                        <td
                          className={`px-2 py-1.5 text-right font-semibold ${
                            row.profit >= 0 ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          ¥{row.profit.toLocaleString()}
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <MarginIndicator marginPct={row.marginPct} />
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${meta.pill}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
                              {meta.label}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 bg-slate-50 text-[11px] font-semibold">
                    <td colSpan={3} className="px-2 py-2 text-slate-700">
                      合計({sortedRows.length} 件)
                    </td>
                    <td className="px-2 py-2 text-right text-slate-900">
                      ¥{totals.revenue.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 text-right text-amber-700">
                      ¥{totals.cost.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 text-right text-emerald-700">
                      ¥{totals.profit.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 text-emerald-700">{totals.marginPct}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ページネーション */}
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
              <span className="text-slate-500">
                {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, sortedRows.length)} /{" "}
                {sortedRows.length} 件
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
                  aria-label="前のページ"
                >
                  <ChevronLeft className="h-3 w-3" />
                  前へ
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i)}
                    aria-current={page === i ? "page" : undefined}
                    className={`h-7 min-w-7 rounded-md border px-2 text-xs ${
                      page === i
                        ? "border-blue-500 bg-blue-50 font-semibold text-blue-700"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
                  aria-label="次のページ"
                >
                  次へ
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </CardSection>
        </section>

        {/* === 右サイドバー: 選択案件詳細 === */}
        <aside className="col-span-3">
          <ProjectDetailPanel data={selected} />
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   サブコンポーネント
   ============================================================ */

function ProfitMarginKpi({ marginPct }: { marginPct: number }) {
  const R = 18;
  const C = 2 * Math.PI * R;
  const ratio = Math.min(1, Math.max(0, marginPct / 100));
  const offset = C * (1 - ratio);
  return (
    <div className="flex h-[88px] items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 border-l-4 border-l-emerald-500">
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r={R} stroke="#e2e8f0" strokeWidth="6" fill="none" />
        <circle
          cx="24"
          cy="24"
          r={R}
          stroke="#10b981"
          strokeWidth="6"
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
        />
      </svg>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium text-slate-500">利益率</div>
        <div className="mt-0.5 text-lg font-bold leading-none text-emerald-700">
          {marginPct}%
        </div>
        <div className="mt-1 text-[10px] text-slate-500">経常利益率</div>
      </div>
    </div>
  );
}

function MarginIndicator({ marginPct }: { marginPct: number }) {
  const color =
    marginPct >= 40
      ? "bg-emerald-500"
      : marginPct >= 25
        ? "bg-blue-500"
        : marginPct >= 10
          ? "bg-amber-500"
          : "bg-rose-500";
  const width = Math.min(100, Math.max(0, marginPct));
  return (
    <div className="flex items-center gap-1">
      <div className="h-1.5 w-10 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${color}`} style={{ width: `${width * 1.6}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-slate-800 whitespace-nowrap">
        {marginPct}%
      </span>
    </div>
  );
}

/**
 * 月別 売上・原価・利益 bar chart(SVG 自前)
 */
function MonthlyBarChart({
  data,
}: {
  data: Array<{ month: string; revenue: number; cost: number; profit: number }>;
}) {
  const W = 800;
  const H = 220;
  const PAD = { l: 70, r: 16, t: 12, b: 32 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const maxValue = Math.max(1, ...data.map((d) => d.revenue));
  const niceMax = Math.ceil(maxValue / 50_000_000) * 50_000_000;

  const groupWidth = innerW / data.length;
  const barWidth = groupWidth / 4;

  const yTicks = Array.from({ length: 5 }, (_, i) => (niceMax / 4) * i);

  const summary = data
    .map((d) => `${d.month}: 売上 ¥${d.revenue.toLocaleString()} 利益 ¥${d.profit.toLocaleString()}`)
    .join(", ");

  return (
    <div className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[220px] w-full"
        role="img"
        aria-label={`月別 売上・原価・利益(12 ヶ月)。${summary}`}
      >
        {yTicks.map((y, i) => {
          const yPos = PAD.t + innerH - (y / niceMax) * innerH;
          return (
            <g key={i}>
              <line
                x1={PAD.l}
                x2={PAD.l + innerW}
                y1={yPos}
                y2={yPos}
                stroke={i === 0 ? "#cbd5e1" : "#e2e8f0"}
                strokeWidth={i === 0 ? 1 : 0.5}
              />
              <text
                x={PAD.l - 8}
                y={yPos + 3}
                textAnchor="end"
                fontSize="9"
                fill="#64748b"
              >
                {(y / 1_000_000).toLocaleString()}M
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const xStart = PAD.l + i * groupWidth + (groupWidth - barWidth * 3) / 2;
          const heightRev = (d.revenue / niceMax) * innerH;
          const heightCost = (d.cost / niceMax) * innerH;
          const heightProf = (Math.max(0, d.profit) / niceMax) * innerH;
          return (
            <g key={d.month}>
              <rect
                x={xStart}
                y={PAD.t + innerH - heightRev}
                width={barWidth}
                height={heightRev}
                fill="#2563eb"
                rx={1}
              />
              <rect
                x={xStart + barWidth}
                y={PAD.t + innerH - heightCost}
                width={barWidth}
                height={heightCost}
                fill="#f59e0b"
                rx={1}
              />
              <rect
                x={xStart + barWidth * 2}
                y={PAD.t + innerH - heightProf}
                width={barWidth}
                height={heightProf}
                fill="#10b981"
                rx={1}
              />
              <text
                x={PAD.l + i * groupWidth + groupWidth / 2}
                y={H - 12}
                textAnchor="middle"
                fontSize="9"
                fill="#475569"
              >
                {d.month.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-3 rounded-sm bg-blue-600" aria-hidden />
          売上
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-3 rounded-sm bg-amber-500" aria-hidden />
          原価
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-3 rounded-sm bg-emerald-500" aria-hidden />
          利益
        </div>
      </div>
    </div>
  );
}

/**
 * 右サイドバー:選択中案件詳細パネル
 */
function ProjectDetailPanel({
  data,
}: {
  data: { project: ProjectRow } & CostMetrics;
}) {
  const { project, revenue, cost, profit, marginPct } = data;
  const meta = STATUS_META[project.status];

  return (
    <div className="flex flex-col gap-3">
      <CardSection title={project.name} icon={Building2} sticky>
        <div className="flex flex-col gap-2">
          {/* 状態 + 工種 + 顧客 */}
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.pill}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
              {meta.label}
            </span>
            <span className="text-[10px] font-mono text-slate-500">{project.code}</span>
          </div>

          {/* 大型 利益額 */}
          <div className="text-center">
            <div className="text-[10px] font-medium text-slate-500">利益額</div>
            <div
              className={`mt-0.5 text-2xl font-bold leading-none ${
                profit >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              ¥{profit.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] font-semibold text-emerald-700">
              利益率 {marginPct}%
            </div>
          </div>

          {/* 工期(progressPct ベース) */}
          <div className="rounded-md border border-slate-100 bg-slate-50 p-2">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-slate-600">工期</span>
              <span className="text-[11px] font-bold text-blue-700">
                {project.progressPct}% / 予定 {project.plannedPct}%
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-valuenow={project.progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`案件進捗 ${project.progressPct}%`}
            >
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${project.progressPct}%` }}
              />
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              {project.startedAt} 〜 {project.dueAt}
            </div>
          </div>

          {/* 金額内訳 */}
          <ul className="flex flex-col gap-0.5 text-[11px]">
            <InfoRow label="売上" value={`¥${revenue.toLocaleString()}`} />
            <InfoRow label="原価" value={`¥${cost.toLocaleString()}`} valueColor="text-amber-700" />
            <InfoRow
              label="利益額"
              value={`¥${profit.toLocaleString()}`}
              valueColor={profit >= 0 ? "text-emerald-700" : "text-rose-700"}
            />
            <InfoRow
              label="受注金額"
              value={`¥${project.contractYen.toLocaleString()}`}
            />
          </ul>

          {/* 案件情報 */}
          <ul className="flex flex-col gap-1.5 border-t border-slate-100 pt-2 text-[11px]">
            <InfoRow icon={User} label="現場リーダー" value={project.leader} />
            <InfoRow icon={Wrench} label="工種" value={project.workType} />
            <InfoRow icon={Building2} label="顧客" value={project.customer} />
            <InfoRow
              icon={Calendar}
              label="住所"
              value={project.address.replace(/^宮城県/, "").substring(0, 16)}
            />
          </ul>

          {/* 印刷ボタン */}
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-2 inline-flex items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <FileText className="h-3.5 w-3.5" />
            工事概況を印刷
          </button>
        </div>
      </CardSection>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
  icon: Icon,
}: {
  label: string;
  value: string;
  valueColor?: string;
  icon?: typeof Building2;
}) {
  return (
    <li className="flex items-baseline gap-2">
      {Icon && <Icon className="h-3 w-3 flex-shrink-0 text-slate-400" aria-hidden />}
      <span className="flex-shrink-0 text-slate-500">{label}</span>
      <span
        className={`ml-auto truncate text-right font-medium ${valueColor ?? "text-slate-800"}`}
      >
        {value}
      </span>
    </li>
  );
}
