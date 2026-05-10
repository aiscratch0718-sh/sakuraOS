/**
 * 売上・原価・利益(今期累計)月次グラフ。
 * Recharts 未導入のため SVG で簡易棒グラフ + 折れ線を描画。
 * 4月始まり 12 ヶ月。
 *
 * TODO(P12-01-data): 原価管理ビュー / 売上集計から本実装。現状は暫定モック。
 */
const MOCK: Array<{
  month: string;
  revenue: number;
  cost: number;
  profit: number;
}> = [
  { month: "4", revenue: 9.2, cost: 7.5, profit: 1.7 },
  { month: "5", revenue: 10.4, cost: 8.4, profit: 2.0 },
  { month: "6", revenue: 11.8, cost: 9.5, profit: 2.3 },
  { month: "7", revenue: 12.2, cost: 10.1, profit: 2.1 },
  { month: "8", revenue: 10.6, cost: 8.8, profit: 1.8 },
  { month: "9", revenue: 11.9, cost: 9.6, profit: 2.3 },
  { month: "10", revenue: 13.1, cost: 10.5, profit: 2.6 },
  { month: "11", revenue: 12.4, cost: 10.0, profit: 2.4 },
  { month: "12", revenue: 14.2, cost: 11.3, profit: 2.9 },
  { month: "1", revenue: 9.8, cost: 8.1, profit: 1.7 },
  { month: "2", revenue: 8.6, cost: 7.0, profit: 1.6 },
  { month: "3", revenue: 8.4, cost: 6.9, profit: 1.5 },
];

export function RevenueCostProfitChart() {
  const data = MOCK;
  const max = Math.max(...data.map((d) => d.revenue));
  const W = 360;
  const H = 160;
  const PAD = { l: 24, r: 8, t: 12, b: 22 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const barGroupW = innerW / data.length;
  const barW = (barGroupW - 6) / 2;

  // 利益ラインのポイント計算
  const linePoints = data.map((d, i) => {
    const x = PAD.l + barGroupW * i + barGroupW / 2;
    const y = PAD.t + innerH - (d.profit / max) * innerH;
    return `${x},${y}`;
  });

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="月次の売上・原価・利益グラフ"
      >
        {/* 横グリッド */}
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <line
            key={r}
            x1={PAD.l}
            y1={PAD.t + innerH * (1 - r)}
            x2={W - PAD.r}
            y2={PAD.t + innerH * (1 - r)}
            stroke="#e8eef5"
            strokeWidth="0.5"
          />
        ))}

        {data.map((d, i) => {
          const xBase = PAD.l + barGroupW * i + 3;
          const revH = (d.revenue / max) * innerH;
          const costH = (d.cost / max) * innerH;
          return (
            <g key={d.month}>
              {/* 売上(青) */}
              <rect
                x={xBase}
                y={PAD.t + innerH - revH}
                width={barW}
                height={revH}
                fill="#2568c8"
                rx="1"
              />
              {/* 原価(橙) */}
              <rect
                x={xBase + barW + 2}
                y={PAD.t + innerH - costH}
                width={barW}
                height={costH}
                fill="#f8a820"
                rx="1"
              />
              {/* x ラベル */}
              <text
                x={xBase + barW}
                y={H - 6}
                fontSize="8"
                fill="#7890a8"
                textAnchor="middle"
              >
                {d.month}
              </text>
            </g>
          );
        })}

        {/* 利益ライン(緑) */}
        <polyline
          points={linePoints.join(" ")}
          fill="none"
          stroke="#0da870"
          strokeWidth="1.5"
        />
        {data.map((d, i) => {
          const x = PAD.l + barGroupW * i + barGroupW / 2;
          const y = PAD.t + innerH - (d.profit / max) * innerH;
          return <circle key={i} cx={x} cy={y} r="2" fill="#0da870" />;
        })}

        {/* y 軸単位 */}
        <text x={4} y={PAD.t + 4} fontSize="7" fill="#7890a8">
          百万円
        </text>
      </svg>

      {/* 凡例 */}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-ink-2 justify-center">
        <span className="flex items-center gap-1">
          <span aria-hidden className="w-2.5 h-2.5 rounded-sm bg-blue" />
          売上
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden className="w-2.5 h-2.5 rounded-sm bg-amber-2" />
          原価
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden className="w-2.5 h-0.5 bg-teal" />
          利益
        </span>
      </div>
    </div>
  );
}
