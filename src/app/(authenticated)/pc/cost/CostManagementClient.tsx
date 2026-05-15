"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  Download,
  TrendingUp,
  DollarSign,
  PieChart,
  ArrowUpRight,
  Trophy,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import { MetricCard, CardSection, PageHeader } from "@/components/ui";
import type { ProjectRow } from "../projects/_data/mock-projects";

/* ============================================================
   設定 / 定数
   ============================================================ */

/** 工種ごとの想定原価率(売上に対する比率) */
const COST_RATE_BY_WORKTYPE: Record<string, number> = {
  給排水工事: 0.62,
  給湯設備工事: 0.58,
  排水管工事: 0.65,
  配管点検工事: 0.45,
  改修工事: 0.7,
  ガス配管工事: 0.6,
};

const DEFAULT_COST_RATE = 0.65;

const MONTH_LABELS = [
  "2026/1",
  "2026/2",
  "2026/3",
  "2026/4",
  "2026/5",
  "2026/6",
  "2026/7",
  "2026/8",
  "2026/9",
];

/* ============================================================
   純粋関数: 案件 → 原価メトリクス
   ============================================================ */

type CostMetrics = {
  revenue: number; // 売上(進捗ベース計上)
  cost: number; // 原価
  profit: number; // 利益
  marginPct: number; // 利益率(%)
  costRate: number; // 原価率(0-1)
};

/**
 * 1 案件 → 売上 / 原価 / 利益 / 利益率 を導出。
 * 売上 = 受注金額 × 進捗率 / 原価 = 売上 × 工種別原価率
 */
function deriveCostMetrics(project: ProjectRow): CostMetrics {
  const costRate = COST_RATE_BY_WORKTYPE[project.workType] ?? DEFAULT_COST_RATE;
  const revenue = Math.floor(project.contractYen * (project.progressPct / 100));
  const cost = Math.floor(revenue * costRate);
  const profit = revenue - cost;
  const marginPct = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;
  return { revenue, cost, profit, marginPct, costRate };
}

/**
 * 月次データの擬似生成。
 * 各案件の startedAt〜dueAt にわたって売上を均等配分し、月別 sum を計算。
 */
function generateMonthlyData(
  projects: ProjectRow[],
  months: string[],
): Array<{ month: string; revenue: number; cost: number; profit: number }> {
  return months.map((m, idx) => {
    // mock seed: project.id ハッシュ + 月 index で決定的に変動
    const result = projects.reduce(
      (acc, p) => {
        const metrics = deriveCostMetrics(p);
        const idNum = parseInt(p.id.replace(/\D/g, ""), 10) || 1;
        // 月ごとの分配:山なりにする(中央月で多め)
        const variance = 0.6 + 0.8 * Math.abs(Math.sin((idx + idNum) * 0.7));
        const revShare = metrics.revenue / 9; // 9 ヶ月分配
        const costShare = metrics.cost / 9;
        return {
          revenue: acc.revenue + Math.floor(revShare * variance),
          cost: acc.cost + Math.floor(costShare * variance),
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
   メインクライアントコンポーネント
   ============================================================ */

export function CostManagementClient({ projects }: { projects: ProjectRow[] }) {
  const [periodLabel, setPeriodLabel] = useState("2026/1 〜 2026/9");

  // 案件別メトリクス
  const projectMetrics = useMemo(
    () =>
      projects.map((p) => ({
        project: p,
        ...deriveCostMetrics(p),
      })),
    [projects],
  );

  // 全体集計
  const totals = useMemo(() => {
    const revenue = projectMetrics.reduce((s, m) => s + m.revenue, 0);
    const cost = projectMetrics.reduce((s, m) => s + m.cost, 0);
    const profit = revenue - cost;
    const marginPct = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;
    return { revenue, cost, profit, marginPct };
  }, [projectMetrics]);

  // 月次データ
  const monthlyData = useMemo(
    () => generateMonthlyData(projects, MONTH_LABELS),
    [projects],
  );

  // 利益率ランキング(高い順 Top 5、売上 0 は除外)
  const topProjects = useMemo(
    () =>
      [...projectMetrics]
        .filter((m) => m.revenue > 0)
        .sort((a, b) => b.marginPct - a.marginPct)
        .slice(0, 5),
    [projectMetrics],
  );

  // 案件別 table data(売上昇順)
  const tableData = useMemo(
    () => [...projectMetrics].sort((a, b) => b.revenue - a.revenue),
    [projectMetrics],
  );

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {/* ヘッダー */}
      <PageHeader
        breadcrumbs={[{ label: "SAKURA OS" }, { label: "原価管理" }]}
        icon={Calculator}
        title="原価管理"
        subtitle="現場別の売上・原価・利益を月次で集計します"
        actions={
          <>
            <select
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
              aria-label="集計期間"
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option>2026/1 〜 2026/9</option>
              <option>2026/Q1</option>
              <option>2026/Q2</option>
              <option>2026 年度</option>
            </select>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              CSV エクスポート
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
        <KpiCardWithDonut
          label="利益率"
          value={`${totals.marginPct}%`}
          ratio={totals.marginPct / 100}
          subText={`累計利益 ¥${totals.profit.toLocaleString()}`}
        />
        <MetricCard
          label="原価合計"
          value={`¥${totals.cost.toLocaleString()}`}
          subText={`原価率 ${((totals.cost / Math.max(1, totals.revenue)) * 100).toFixed(1)}%`}
          icon={TrendingUp}
          accent="border-l-amber-500"
          iconColor="text-amber-600"
        />
        <MetricCard
          label="利益額"
          value={`¥${totals.profit.toLocaleString()}`}
          subText={`${projectMetrics.filter((m) => m.profit > 0).length} 案件で利益計上`}
          icon={ArrowUpRight}
          accent="border-l-emerald-500"
          iconColor="text-emerald-600"
        />
      </div>

      {/* メイン 2 列: 中央(chart + table) / 右(ランキング) */}
      <div className="grid grid-cols-12 gap-3">
        {/* === 中央 === */}
        <section className="col-span-9 flex flex-col gap-3">
          {/* 月次 chart */}
          <CardSection title="売上・原価・利益(月次)" icon={PieChart}>
            <MonthlyBarChart data={monthlyData} />
          </CardSection>

          {/* 案件別 table */}
          <CardSection title="案件別 売上・原価・利益" icon={Wrench}>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-xs">
                <colgroup>
                  <col style={{ width: "32%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "16%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-600">
                    <th scope="col" className="px-2 py-1.5 text-left font-medium">案件名 / 工種</th>
                    <th scope="col" className="px-2 py-1.5 text-right font-medium">受注金額</th>
                    <th scope="col" className="px-2 py-1.5 text-right font-medium">売上(計上)</th>
                    <th scope="col" className="px-2 py-1.5 text-right font-medium">原価</th>
                    <th scope="col" className="px-2 py-1.5 text-right font-medium">利益</th>
                    <th scope="col" className="px-2 py-1.5 text-left font-medium">利益率</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row) => (
                    <tr key={row.project.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-2 py-1.5">
                        <div className="truncate font-medium text-slate-800">{row.project.name}</div>
                        <div className="text-[10px] text-slate-500">{row.project.workType}</div>
                      </td>
                      <td className="px-2 py-1.5 text-right text-slate-700">
                        ¥{row.project.contractYen.toLocaleString()}
                      </td>
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
                        <MarginBar marginPct={row.marginPct} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 bg-slate-50 text-[11px] font-semibold">
                    <td className="px-2 py-2 text-slate-700">合計({tableData.length} 件)</td>
                    <td className="px-2 py-2 text-right text-slate-700">
                      ¥{tableData.reduce((s, r) => s + r.project.contractYen, 0).toLocaleString()}
                    </td>
                    <td className="px-2 py-2 text-right text-slate-900">¥{totals.revenue.toLocaleString()}</td>
                    <td className="px-2 py-2 text-right text-amber-700">¥{totals.cost.toLocaleString()}</td>
                    <td className="px-2 py-2 text-right text-emerald-700">¥{totals.profit.toLocaleString()}</td>
                    <td className="px-2 py-2 text-emerald-700">{totals.marginPct}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardSection>
        </section>

        {/* === 右サイドバー === */}
        <aside className="col-span-3 flex flex-col gap-3">
          {/* 利益率 Top 5 */}
          <CardSection title="利益率 Top 5" icon={Trophy}>
            <ol className="flex flex-col gap-1.5">
              {topProjects.map((m, i) => (
                <li
                  key={m.project.id}
                  className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5"
                >
                  <span
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      i === 0
                        ? "bg-amber-100 text-amber-700"
                        : i === 1
                          ? "bg-slate-200 text-slate-700"
                          : i === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-600"
                    }`}
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium text-slate-800">
                      {m.project.name}
                    </div>
                    <div className="text-[9px] text-slate-500">{m.project.workType}</div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700">{m.marginPct}%</span>
                </li>
              ))}
            </ol>
          </CardSection>

          {/* 警告:低利益案件 */}
          <CardSection title="低利益案件" icon={AlertTriangle}>
            <ul className="flex flex-col gap-1.5">
              {projectMetrics
                .filter((m) => m.revenue > 0 && m.marginPct < 30)
                .slice(0, 4)
                .map((m) => (
                  <li
                    key={m.project.id}
                    className="flex items-center gap-2 rounded-md border border-rose-100 bg-rose-50/40 px-2 py-1.5"
                  >
                    <AlertTriangle className="h-3 w-3 flex-shrink-0 text-rose-600" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[11px] font-medium text-slate-800">
                        {m.project.name}
                      </div>
                      <div className="text-[9px] text-slate-500">{m.project.workType}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-rose-700">{m.marginPct}%</span>
                  </li>
                ))}
              {projectMetrics.filter((m) => m.revenue > 0 && m.marginPct < 30).length === 0 && (
                <li className="rounded-md bg-emerald-50 px-2 py-2 text-center text-[11px] text-emerald-700">
                  低利益案件なし
                </li>
              )}
            </ul>
          </CardSection>

          {/* 工種別 利益率(凡例) */}
          <CardSection title="工種別 利益率" icon={PieChart}>
            <ul className="flex flex-col gap-1.5">
              {Object.entries(COST_RATE_BY_WORKTYPE).map(([wt, cr]) => {
                const marginPct = Math.round((1 - cr) * 1000) / 10;
                return (
                  <li
                    key={wt}
                    className="flex items-center gap-1.5 text-[10px] text-slate-700"
                  >
                    <span className="truncate flex-1">{wt}</span>
                    <span className="font-semibold text-slate-900">{marginPct}%</span>
                  </li>
                );
              })}
            </ul>
          </CardSection>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   サブコンポーネント
   ============================================================ */

/**
 * 利益率 KPI(円グラフ風 SVG donut 付き)
 */
function KpiCardWithDonut({
  label,
  value,
  ratio,
  subText,
}: {
  label: string;
  value: string;
  ratio: number;
  subText: string;
}) {
  const R = 18;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - Math.min(1, Math.max(0, ratio)));
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
        <div className="text-[11px] font-medium text-slate-500">{label}</div>
        <div className="mt-0.5 text-lg font-bold leading-none text-emerald-700">{value}</div>
        <div className="mt-1 truncate text-[10px] text-slate-500">{subText}</div>
      </div>
    </div>
  );
}

/**
 * 利益率を視覚的に表示するミニバー(色は利益率に応じて変動)
 */
function MarginBar({ marginPct }: { marginPct: number }) {
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
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${color}`} style={{ width: `${width * 1.6}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-slate-800">{marginPct}%</span>
    </div>
  );
}

/**
 * 月次 売上・原価・利益 bar chart(SVG 直書き)
 */
function MonthlyBarChart({
  data,
}: {
  data: Array<{ month: string; revenue: number; cost: number; profit: number }>;
}) {
  const W = 720;
  const H = 220;
  const PAD = { l: 70, r: 16, t: 12, b: 28 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const maxValue = Math.max(1, ...data.map((d) => d.revenue));
  const niceMax = Math.ceil(maxValue / 5_000_000) * 5_000_000;

  // X 軸: 月数で等分
  const groupWidth = innerW / data.length;
  const barWidth = groupWidth / 4;

  // Y 軸 ticks (5 段)
  const yTicks = Array.from({ length: 5 }, (_, i) => (niceMax / 4) * i);

  // ラベル要約(aria-label 用)
  const summary = data
    .map((d) => `${d.month}: 売上 ¥${d.revenue.toLocaleString()} / 利益 ¥${d.profit.toLocaleString()}`)
    .join(", ");

  return (
    <div className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[220px] w-full"
        role="img"
        aria-label={`月次の売上・原価・利益 chart。${summary}`}
      >
        {/* Y 軸 grid + label */}
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
                {(y / 10000).toLocaleString()}万
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const xStart = PAD.l + i * groupWidth + (groupWidth - barWidth * 3) / 2;
          const heightRev = (d.revenue / niceMax) * innerH;
          const heightCost = (d.cost / niceMax) * innerH;
          const heightProf = (Math.max(0, d.profit) / niceMax) * innerH;
          return (
            <g key={d.month}>
              {/* 売上(青) */}
              <rect
                x={xStart}
                y={PAD.t + innerH - heightRev}
                width={barWidth}
                height={heightRev}
                fill="#2563eb"
                rx={1}
              />
              {/* 原価(橙) */}
              <rect
                x={xStart + barWidth}
                y={PAD.t + innerH - heightCost}
                width={barWidth}
                height={heightCost}
                fill="#f59e0b"
                rx={1}
              />
              {/* 利益(緑) */}
              <rect
                x={xStart + barWidth * 2}
                y={PAD.t + innerH - heightProf}
                width={barWidth}
                height={heightProf}
                fill="#10b981"
                rx={1}
              />
              {/* X 軸ラベル */}
              <text
                x={PAD.l + i * groupWidth + groupWidth / 2}
                y={H - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#475569"
              >
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 凡例 */}
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
