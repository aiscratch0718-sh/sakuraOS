/**
 * 得意分野マップ(レーダーチャート、SVG)。
 * 大分類(l1)ごとの累計時間を 0-100 でスケーリングし表示。
 */

export type SkillData = { label: string; value: number };

export function SkillRadar({
  data,
  size = 240,
}: {
  data: SkillData[];
  size?: number;
}) {
  if (data.length < 3) {
    return (
      <div className="text-[11px] text-ink-3 py-4 text-center">
        日報を 3 種類以上の大分類で 3 件以上提出すると表示されます。
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 30;
  const max = Math.max(...data.map((d) => d.value), 1);
  const angleStep = (2 * Math.PI) / data.length;

  // データポイント
  const points = data.map((d, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (d.value / max) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      angle,
      label: d.label,
      value: d.value,
    };
  });

  // 軸ライン端点
  const axes = data.map((_, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      labelX: cx + (radius + 16) * Math.cos(angle),
      labelY: cy + (radius + 16) * Math.sin(angle),
    };
  });

  // ガイド円(25/50/75/100%)
  const guides = [0.25, 0.5, 0.75, 1.0];

  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
    >
      {/* ガイド円 */}
      {guides.map((g) => (
        <circle
          key={g}
          cx={cx}
          cy={cy}
          r={radius * g}
          fill="none"
          stroke="#c8d8e8"
          strokeWidth={1}
          strokeDasharray={g === 1 ? undefined : "2 3"}
        />
      ))}

      {/* 軸ライン */}
      {axes.map((a, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={a.x}
          y2={a.y}
          stroke="#c8d8e8"
          strokeWidth={1}
        />
      ))}

      {/* データポリゴン */}
      <polygon
        points={polygonPath}
        fill="rgba(37, 104, 200, 0.25)"
        stroke="#2568c8"
        strokeWidth={2}
      />

      {/* データ点 */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#2568c8" />
      ))}

      {/* ラベル */}
      {points.map((p, i) => (
        <text
          key={i}
          x={axes[i]!.labelX}
          y={axes[i]!.labelY}
          fontSize={11}
          fill="#1a2a3a"
          textAnchor={
            Math.cos(p.angle) > 0.2
              ? "start"
              : Math.cos(p.angle) < -0.2
                ? "end"
                : "middle"
          }
          dominantBaseline={
            Math.sin(p.angle) > 0.2
              ? "hanging"
              : Math.sin(p.angle) < -0.2
                ? "auto"
                : "middle"
          }
          fontWeight="bold"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}
