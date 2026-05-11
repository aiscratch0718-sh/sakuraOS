const MOCK: Array<{
  month: string;
  revenue: number;
  cost: number;
  profit: number;
}> = [
  { month: "4月", revenue: 70, cost: 48, profit: 42 },
  { month: "5月", revenue: 98, cost: 61, profit: 67 },
  { month: "6月", revenue: 84, cost: 64, profit: 82 },
  { month: "7月", revenue: 102, cost: 78, profit: 91 },
  { month: "8月", revenue: 94, cost: 50, profit: 55 },
  { month: "9月", revenue: 104, cost: 60, profit: 78 },
  { month: "10月", revenue: 128, cost: 76, profit: 70 },
  { month: "11月", revenue: 88, cost: 58, profit: 34 },
  { month: "12月", revenue: 101, cost: 72, profit: 52 },
  { month: "1月", revenue: 112, cost: 66, profit: 67 },
  { month: "2月", revenue: 130, cost: 82, profit: 72 },
  { month: "3月", revenue: 132, cost: 80, profit: 76 },
];

export function RevenueCostProfitChart() {
  const data = MOCK;
  const max = 160;
  const W = 430;
  const H = 210;
  const PAD = { l: 42, r: 10, t: 18, b: 30 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const barGroupW = innerW / data.length;
  const barW = 8;

  const linePoints = data.map((d, i) => {
    const x = PAD.l + barGroupW * i + barGroupW / 2;
    const y = PAD.t + innerH - (d.profit / max) * innerH;
    return `${x},${y}`;
  });

  return (
    <div className="dashboard-revenue-chart w-full">
      <div className="dashboard-revenue-legend mb-3 flex items-center justify-center gap-5 text-[12px] font-medium text-slate-700">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-blue-600" aria-hidden />
          売上（千円）
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-orange-500" aria-hidden />
          原価（千円）
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-4 rounded-sm bg-emerald-600" aria-hidden />
          利益（千円）
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="dashboard-revenue-chart-svg h-auto w-full"
        role="img"
        aria-label="月次の売上・原価・利益グラフ"
      >
        {[0, 40, 80, 120, 160].map((v) => {
          const y = PAD.t + innerH - (v / max) * innerH;
          return (
            <g key={v}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x={PAD.l - 8} y={y + 3} fontSize="10" fill="#64748b" textAnchor="end">
                {v.toLocaleString("ja-JP")},000
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const xBase = PAD.l + barGroupW * i + barGroupW / 2 - barW - 1;
          const revH = (d.revenue / max) * innerH;
          const costH = (d.cost / max) * innerH;
          return (
            <g key={d.month}>
              <rect x={xBase} y={PAD.t + innerH - revH} width={barW} height={revH} fill="#2563eb" rx="1.5" />
              <rect x={xBase + barW + 3} y={PAD.t + innerH - costH} width={barW} height={costH} fill="#f97316" rx="1.5" />
              <text x={PAD.l + barGroupW * i + barGroupW / 2} y={H - 8} fontSize="10" fill="#64748b" textAnchor="middle">
                {d.month}
              </text>
            </g>
          );
        })}

        <polyline points={linePoints.join(" ")} fill="none" stroke="#16a34a" strokeWidth="2" />
        {data.map((d, i) => {
          const x = PAD.l + barGroupW * i + barGroupW / 2;
          const y = PAD.t + innerH - (d.profit / max) * innerH;
          return <circle key={i} cx={x} cy={y} r="3" fill="#16a34a" stroke="#fff" strokeWidth="1" />;
        })}
      </svg>
    </div>
  );
}
