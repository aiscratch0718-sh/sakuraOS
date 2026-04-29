/**
 * 直近 14 日の XP 獲得タイムライン(SVGバーチャート)。
 */

export function XpTimeline({
  series,
}: {
  series: { date: string; xp: number }[];
}) {
  if (series.length === 0) {
    return (
      <div className="text-[11px] text-ink-3 py-4 text-center">
        まだ XP 履歴がありません。
      </div>
    );
  }

  const w = 320;
  const h = 80;
  const pad = 8;
  const max = Math.max(...series.map((d) => d.xp), 1);
  const barW = (w - pad * 2) / series.length;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${h + 18}`}
      className="block"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* ベースライン */}
      <line x1={pad} y1={h} x2={w - pad} y2={h} stroke="#c8d8e8" />

      {series.map((d, i) => {
        const barH = (d.xp / max) * (h - 8);
        const x = pad + i * barW;
        const y = h - barH;
        return (
          <g key={i}>
            <rect
              x={x + 2}
              y={y}
              width={barW - 4}
              height={barH}
              fill="#7040c8"
              opacity={d.xp > 0 ? 1 : 0.2}
              rx={2}
            />
            <text
              x={x + barW / 2}
              y={h + 12}
              fontSize={9}
              fill="#7890a8"
              textAnchor="middle"
            >
              {/* MM/DD 形式の日付ラベル(7 日に 1 つだけ) */}
              {i % 2 === series.length % 2 ? d.date.slice(5).replace("-", "/") : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
