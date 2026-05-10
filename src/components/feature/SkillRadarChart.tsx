import type { CSSProperties } from "react";

/**
 * SkillRadarChart — 6軸スキルレーダーチャート(Server Component)
 *
 * 設計指針:
 * - "use client" 不要 — propsから純粋に頂点座標を計算してSVGを描画
 * - 6軸固定(時計回り、上から: 技術力 / 判断力 / 安全 / 報連相 / 体力 / 責任感)
 * - CSS変数 (--p1〜--p4, --gold) でテーマと連動
 * - prefers-reduced-motion で transition を 0 に短縮
 *
 * 例:
 *   <SkillRadarChart
 *     accent="p2"
 *     axes={[
 *       { label: "技術力", value: 82 },
 *       { label: "判断力", value: 75 },
 *       { label: "安全",   value: 90 },
 *       { label: "報連相", value: 68 },
 *       { label: "体力",   value: 72 },
 *       { label: "責任感", value: 85 },
 *     ]}
 *   />
 */

export type SkillAxis = {
  /** 軸ラベル(例: "技術力") */
  label: string;
  /** 0-100 の数値(範囲外は clamp される) */
  value: number;
  /** 各軸の頂点マーカー色(任意。未指定なら accent 色) */
  color?: string;
};

/**
 * 6 軸固定タプル。配列リテラルで6個未満を渡すと TypeScript がコンパイルエラーにする。
 */
export type SkillAxes = readonly [
  SkillAxis,
  SkillAxis,
  SkillAxis,
  SkillAxis,
  SkillAxis,
  SkillAxis,
];

export type SkillRadarAccent = "p1" | "p2" | "p3" | "p4" | "gold";

export type SkillRadarChartProps = {
  axes: SkillAxes;
  /** SVG viewBox サイズ。デフォ 280 */
  size?: number;
  /** 多角形の塗り/線色アクセント。デフォ "p2" */
  accent?: SkillRadarAccent;
  /** ラベル表示。デフォ true */
  showLabels?: boolean;
  /** 追加 className(ラッパー <svg>) */
  className?: string;
};

const ACCENT_VAR: Record<SkillRadarAccent, string> = {
  p1: "var(--p1)",
  p2: "var(--p2)",
  p3: "var(--p3)",
  p4: "var(--p4)",
  gold: "var(--gold)",
};

/** 0..100 → 0..1 にクランプ */
const clamp01 = (v: number): number =>
  v < 0 ? 0 : v > 100 ? 1 : v / 100;

export function SkillRadarChart({
  axes,
  size = 280,
  accent = "p2",
  showLabels = true,
  className = "",
}: SkillRadarChartProps) {
  const N = 6;
  const cx = size / 2;
  const cy = size / 2;
  // ラベルとマーカー分の余白を確保した最大半径
  const maxRadius = (size / 2) * (showLabels ? 0.72 : 0.92);
  const labelRadius = (size / 2) * 0.92;

  // 各軸の角度: 上 (-π/2) を起点に時計回りに 2π/N 刻み。
  // 直交座標化: x = cx + r·cos(θ), y = cy + r·sin(θ)
  const angle = (i: number): number => -Math.PI / 2 + (2 * Math.PI * i) / N;

  const accentColor = ACCENT_VAR[accent];

  // グリッド多角形(3 段階の半径: 100% / 66% / 33%)
  const gridRings = [1, 2 / 3, 1 / 3].map((ratio) => {
    const r = maxRadius * ratio;
    const points = Array.from({ length: N }, (_, i) => {
      const a = angle(i);
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return { ratio, points };
  });

  // 放射線(中心 → 各頂点)
  const spokes = Array.from({ length: N }, (_, i) => {
    const a = angle(i);
    return {
      x2: cx + maxRadius * Math.cos(a),
      y2: cy + maxRadius * Math.sin(a),
    };
  });

  // データ多角形の頂点群
  const dataVertices = axes.map((ax, i) => {
    const a = angle(i);
    const r = maxRadius * clamp01(ax.value);
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
      labelX: cx + labelRadius * Math.cos(a),
      labelY: cy + labelRadius * Math.sin(a),
      angle: a,
      axis: ax,
    };
  });

  const dataPoints = dataVertices.map((p) => `${p.x},${p.y}`).join(" ");

  // a11y label
  const ariaLabel = `スキルレーダーチャート: ${axes
    .map((a) => `${a.label} ${Math.round(a.value)}`)
    .join(", ")}`;

  // ラベル位置計算(頂点から外側)— text-anchor を角度で決定
  const labelAnchor = (a: number): "start" | "middle" | "end" => {
    const cos = Math.cos(a);
    if (cos > 0.3) return "start";
    if (cos < -0.3) return "end";
    return "middle";
  };

  // CSS変数で transition を制御(prefers-reduced-motion で打ち消し可能)
  const polygonStyle: CSSProperties = {
    fill: accentColor,
    fillOpacity: 0.22,
    stroke: accentColor,
    strokeWidth: 2.5,
    strokeLinejoin: "round",
    transition: "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      style={{ overflow: "visible" }}
    >
      {/* prefers-reduced-motion 対応(scoped) */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .srdr-anim { transition-duration: 0s !important; }
        }
      `}</style>

      {/* グリッド(3 段) */}
      <g aria-hidden>
        {gridRings.map((ring, idx) => (
          <polygon
            key={`grid-${idx}`}
            points={ring.points}
            fill="none"
            stroke="rgba(0,0,0,0.12)"
            strokeWidth={1}
          />
        ))}
        {spokes.map((s, i) => (
          <line
            key={`spoke-${i}`}
            x1={cx}
            y1={cy}
            x2={s.x2}
            y2={s.y2}
            stroke="rgba(0,0,0,0.12)"
            strokeWidth={1}
          />
        ))}
      </g>

      {/* データ多角形 */}
      <polygon
        className="srdr-anim"
        points={dataPoints}
        style={polygonStyle}
      />

      {/* 各頂点マーカー */}
      <g>
        {dataVertices.map((v, i) => (
          <circle
            key={`pt-${i}`}
            cx={v.x}
            cy={v.y}
            r={3.5}
            fill={v.axis.color ?? accentColor}
            stroke="#fff"
            strokeWidth={1.5}
            className="srdr-anim"
            style={{ transition: "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        ))}
      </g>

      {/* ラベル */}
      {showLabels && (
        <g>
          {dataVertices.map((v, i) => {
            const anchor = labelAnchor(v.angle);
            const valueStr = String(Math.round(v.axis.value));
            return (
              <g key={`lbl-${i}`}>
                <text
                  x={v.labelX}
                  y={v.labelY}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  className="fill-ink-2"
                  style={{
                    fontSize: Math.max(10, Math.round(size * 0.045)),
                    fontWeight: 600,
                  }}
                >
                  {v.axis.label}
                </text>
                <text
                  x={v.labelX}
                  y={v.labelY + Math.max(12, Math.round(size * 0.05))}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  style={{
                    fontSize: Math.max(9, Math.round(size * 0.04)),
                    fontWeight: 700,
                    fill: v.axis.color ?? accentColor,
                  }}
                >
                  {valueStr}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}

export default SkillRadarChart;
