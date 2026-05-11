import type { ReactNode } from "react";
import Link from "next/link";

export type KpiAccent = "p1" | "p2" | "p3" | "p4" | "gold" | "blue";

type AccentStyle = {
  borderColor: string;
  titleColor: string;
  helpColor: string;
};

const ACCENT: Record<KpiAccent, AccentStyle> = {
  p1: {
    borderColor: "border-orange-300",
    titleColor: "text-orange-600",
    helpColor: "border-orange-400 text-orange-600",
  },
  p2: {
    borderColor: "border-amber-300",
    titleColor: "text-amber-600",
    helpColor: "border-amber-400 text-amber-600",
  },
  p3: {
    borderColor: "border-emerald-300",
    titleColor: "text-emerald-700",
    helpColor: "border-emerald-500 text-emerald-600",
  },
  p4: {
    borderColor: "border-violet-300",
    titleColor: "text-violet-700",
    helpColor: "border-violet-500 text-violet-600",
  },
  gold: {
    borderColor: "border-yellow-300",
    titleColor: "text-yellow-600",
    helpColor: "border-yellow-500 text-yellow-600",
  },
  blue: {
    borderColor: "border-blue-400",
    titleColor: "text-blue-700",
    helpColor: "border-blue-500 text-blue-700",
  },
};

export function KpiCard({
  accent = "p3",
  label,
  value,
  unit,
  subText,
  trend,
  href,
  hrefLabel,
  children,
  icon: _icon,
}: {
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
  hrefLabel?: string;
  children?: ReactNode;
  /** @deprecated Kept for older call sites. */
  icon?: string;
}) {
  const a = ACCENT[accent];

  return (
    <div
      className={`dashboard-kpi-card relative flex h-[114px] flex-col overflow-hidden rounded-lg border bg-white px-3.5 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-md ${a.borderColor}`}
    >
      <div className="mb-0.5 flex items-center gap-1.5">
        <h3 className={`text-[11px] font-bold ${a.titleColor}`}>{label}</h3>
        <button
          type="button"
          aria-label={`${label}の説明`}
          className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] leading-none transition-colors ${a.helpColor}`}
          tabIndex={-1}
        >
          ?
        </button>
      </div>

      <div className="mb-0.5 flex min-h-[28px] items-center justify-between gap-2">
        <div className="text-[22px] font-black leading-none tracking-normal text-slate-950">
          {value}
          {unit && (
            <span className="ml-0.5 text-[13px] font-extrabold">{unit}</span>
          )}
        </div>
        {children && <div className="flex-shrink-0">{children}</div>}
      </div>

      {subText && (
        <div className="truncate text-[10px] leading-tight text-slate-600">
          {subText}
        </div>
      )}

      {(trend || href) && (
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-1">
          <div className="flex items-center gap-1 text-[10px]">
            {trend && (
              <>
                <span className="text-slate-600">
                  {trend.comparison ?? "前日比"}
                </span>
                <span
                  className={
                    trend.dir === "up"
                      ? "font-bold text-green-600"
                      : trend.dir === "down"
                        ? "font-bold text-red-600"
                        : "font-bold text-slate-500"
                  }
                >
                  {trend.value}{" "}
                  {trend.dir === "up" ? "↑" : trend.dir === "down" ? "↓" : "→"}
                </span>
              </>
            )}
          </div>
          {href && (
            <Link
              href={href}
              className="flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-blue-800"
            >
              {hrefLabel ?? "詳細へ"}
              <span aria-hidden>›</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
