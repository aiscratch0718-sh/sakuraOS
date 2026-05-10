/**
 * 進捗バー: 一般的な業務進捗・達成率の表示用。
 *
 * `value / max` をパーセントで表示。`color` を省略すると進捗率に応じて
 * 自動配色(順調/注意/遅延)。
 */
export function ProgressBar({
  value,
  max = 100,
  color,
  size = "md",
  showLabel = false,
  label,
  className = "",
}: {
  value: number;
  max?: number;
  color?: "p1" | "p2" | "p3" | "p4" | "blue" | "auto";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const heightCls = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";

  // auto モード: 進捗率で配色
  let resolved = color ?? "auto";
  if (resolved === "auto") {
    resolved = pct >= 60 ? "p3" : pct >= 30 ? "p2" : "p1";
  }

  const fillCls: Record<string, string> = {
    p1: "bg-p1",
    p2: "bg-p2",
    p3: "bg-p3",
    p4: "bg-p4",
    blue: "bg-blue",
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
          <span className="text-ink-2">{label ?? "進捗"}</span>
          <span className="text-ink">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={`w-full ${heightCls} bg-panel2 rounded-full overflow-hidden`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${fillCls[resolved as string]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
