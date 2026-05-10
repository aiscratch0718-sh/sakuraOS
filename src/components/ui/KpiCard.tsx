import type { ReactNode } from "react";

export type KpiAccent = "p1" | "p2" | "p3" | "p4" | "gold" | "blue";

type AccentStyle = {
  bar: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
};

const ACCENT: Record<KpiAccent, AccentStyle> = {
  p1: {
    bar: "bg-p1",
    iconBg: "bg-p1-light",
    iconColor: "text-p1",
    valueColor: "text-p1",
  },
  p2: {
    bar: "bg-p2",
    iconBg: "bg-p2-light",
    iconColor: "text-p2",
    valueColor: "text-p2",
  },
  p3: {
    bar: "bg-p3",
    iconBg: "bg-p3-light",
    iconColor: "text-p3",
    valueColor: "text-p3",
  },
  p4: {
    bar: "bg-p4",
    iconBg: "bg-p4-light",
    iconColor: "text-p4",
    valueColor: "text-p4",
  },
  gold: {
    bar: "bg-gold",
    iconBg: "bg-[#FFF9E6]",
    iconColor: "text-p2",
    valueColor: "text-p2",
  },
  blue: {
    bar: "bg-blue",
    iconBg: "bg-blue-bg",
    iconColor: "text-blue",
    valueColor: "text-ink",
  },
};

/**
 * デモ v4.0 の `.stat-card` 準拠の KPI カード。
 * - 左 4px の色付きバー(accent)
 * - 角アイコンタイル(36×36)
 * - ラベル(小) → 値(大) → サブテキスト
 *
 * 例:
 * <KpiCard
 *   icon="🏗️"
 *   accent="p3"
 *   label="本日の全現場達成率"
 *   value={78}
 *   unit="%"
 *   trend={{ dir: "up", value: "12%", comparison: "前日比" }}
 * />
 */
export function KpiCard({
  icon,
  accent = "p3",
  label,
  value,
  unit,
  subText,
  trend,
  href,
  children,
}: {
  icon?: string;
  accent?: KpiAccent;
  label: string;
  value: ReactNode;
  unit?: string;
  subText?: string;
  trend?: {
    dir: "up" | "down" | "flat";
    value: string;
    comparison?: string;
  };
  href?: string;
  children?: ReactNode;
}) {
  const a = ACCENT[accent];
  const Wrap = href ? "a" : "div";
  const wrapProps = href
    ? { href, className: "block group" }
    : { className: "block" };

  return (
    <Wrap {...wrapProps}>
      <div className="relative overflow-hidden bg-panel border border-line rounded-cardLg pl-5 pr-4 py-4 shadow-card transition-all hover:shadow-cardHover hover:-translate-y-0.5">
        {/* 左 4px の accent バー */}
        <span
          aria-hidden
          className={`absolute top-0 left-0 w-1 h-full ${a.bar}`}
        />

        {/* アイコン + ラベル を横並び(参照画像 S5 準拠) */}
        <div className="flex items-center gap-2 mb-2">
          {icon && (
            <div
              className={`w-9 h-9 rounded-card flex items-center justify-center text-[18px] flex-shrink-0 ${a.iconBg} ${a.iconColor}`}
              aria-hidden
            >
              {icon}
            </div>
          )}
          <div className="text-[11px] text-ink-3 font-medium leading-tight flex-1 min-w-0">
            {label}
          </div>
        </div>

        {/* 数値(参照画像 S5 準拠で 28→32px に拡大) */}
        <div
          className={`text-[32px] font-black leading-none tracking-tight ${a.valueColor}`}
        >
          {value}
          {unit && <span className="text-[16px] font-extrabold ml-0.5">{unit}</span>}
        </div>

        {/* サブテキスト + トレンド */}
        {(subText || trend) && (
          <div className="text-[11px] text-ink-3 mt-2 flex items-center gap-1.5">
            {trend && (
              <span
                className={
                  trend.dir === "up"
                    ? "text-status-done font-bold"
                    : trend.dir === "down"
                      ? "text-status-active font-bold"
                      : "text-ink-3 font-bold"
                }
              >
                {trend.dir === "up" ? "↑" : trend.dir === "down" ? "↓" : "→"}{" "}
                {trend.value}
              </span>
            )}
            {trend?.comparison && (
              <span className="text-ink-3">{trend.comparison}</span>
            )}
            {subText && <span className="text-ink-3">{subText}</span>}
          </div>
        )}
        {children}
      </div>
    </Wrap>
  );
}
