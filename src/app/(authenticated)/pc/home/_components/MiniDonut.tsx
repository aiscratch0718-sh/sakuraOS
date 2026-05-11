/**
 * 円グラフ(KPI カード内に埋め込む小さなドーナツ)。
 * 値 0-100 を受け取り、SVG で進捗弧を描画する。
 *
 * a11y: role="img" + aria-label で読み上げ対応。
 */
export function MiniDonut({
  value,
  size = 72,
  stroke = 8,
  color = "#2568c8", // blue.DEFAULT
  trackColor = "#e8f0f8", // bg
  label,
  showValue = false,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  showValue?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);

  return (
    <div
      role="img"
      aria-label={label ?? `${clamped}%`}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showValue && (
        <span className="absolute text-[14px] font-extrabold text-navy">
          {clamped}%
        </span>
      )}
    </div>
  );
}
