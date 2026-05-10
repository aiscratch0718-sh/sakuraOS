/**
 * HPバー: 現場の進捗・ボスHPなど、ゲーム的な「残り量」表示。
 * デモ v4.0 のクエスト/ボスHP表示に対応。
 *
 * - メイン用途: 現場 1 つの「目標 N 単位 / 達成 M 単位」
 * - 進捗率で色変化: ≥80% 緑 / ≥50% 茶金 / ≥30% 茶金 / <30% 赤(パルス)
 */
export function HpBar({
  current,
  max,
  unit = "",
  label = "BOSS HP",
  size = "md",
  className = "",
  pulseOnLow = true,
}: {
  current: number;
  max: number;
  unit?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** 残量30%未満で警告パルス */
  pulseOnLow?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, max > 0 ? (current / max) * 100 : 0));

  // ボスHP系は「達成すると残量が減る」パターンと「達成すると進捗が増える」パターンの2通り
  // ここでは「進捗が増える」前提(現場進捗ベース)
  const tier = pct >= 80 ? "p3" : pct >= 50 ? "p2" : pct >= 30 ? "p2" : "p1";

  const fillCls: Record<string, string> = {
    p1: "bg-p1",
    p2: "bg-p2",
    p3: "bg-p3",
  };

  const barH =
    size === "sm" ? "h-2.5" : size === "lg" ? "h-5" : "h-3.5";
  const labelSize =
    size === "sm" ? "text-[10px]" : size === "lg" ? "text-[14px]" : "text-[12px]";
  const numSize =
    size === "sm" ? "text-[12px]" : size === "lg" ? "text-[20px]" : "text-[14px]";

  const lowPulse = pulseOnLow && pct < 30 ? "animate-pulseSoft" : "";

  return (
    <div className={`relative ${className}`}>
      <div className={`flex justify-between items-baseline mb-1 ${labelSize}`}>
        <span className="font-bold text-ink-2 tracking-wider">{label}</span>
        <span className="font-bold">
          <span className={numSize + " text-ink"}>{current}</span>
          <span className="text-ink-3">
            {" / "}
            {max}
            {unit && ` ${unit}`}
          </span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
        className={`relative w-full ${barH} bg-panel2 rounded-full overflow-hidden border border-line/40`}
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${fillCls[tier]} ${lowPulse}`}
          style={{ width: `${pct}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-ink mix-blend-difference pointer-events-none">
          {Math.round(pct)}%
        </div>
      </div>
    </div>
  );
}
