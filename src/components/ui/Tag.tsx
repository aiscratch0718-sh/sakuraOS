import type { ReactNode } from "react";

export type TagVariant =
  | "p1"
  | "p2"
  | "p3"
  | "p4"
  | "gold"
  | "silver"
  | "bronze"
  | "blue"
  | "amber"
  | "teal"
  | "red"
  | "purple"
  | "neutral";

const VARIANT_CLS: Record<TagVariant, string> = {
  p1: "bg-p1-light text-p1",
  p2: "bg-p2-light text-p2",
  p3: "bg-p3-light text-p3",
  p4: "bg-p4-light text-p4",
  gold: "text-[#7a5c00]",
  silver: "text-[#5a6068]",
  bronze: "text-[#7a4f1f]",
  blue: "bg-blue-bg text-blue",
  amber: "bg-amber-bg text-amber",
  teal: "bg-teal-bg text-teal",
  red: "bg-red-bg text-red",
  purple: "bg-purple-bg text-purple",
  neutral: "bg-graybg text-ink-2",
};

const VARIANT_BG_OVERRIDE: Partial<Record<TagVariant, string>> = {
  gold: "rgba(255,215,0,0.18)",
  silver: "rgba(192,192,192,0.22)",
  bronze: "rgba(205,127,50,0.18)",
};

/**
 * 状態タグ / バッジ。デザイン統一のための薄いラッパー。
 *
 * 例:
 *   <Tag variant="p3">承認済</Tag>
 *   <Tag variant="gold" size="lg">★★★ 金</Tag>
 */
export function Tag({
  variant = "neutral",
  size = "md",
  children,
  className = "",
}: {
  variant?: TagVariant;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}) {
  const sizeCls =
    size === "sm"
      ? "text-[10px] px-1.5 py-0.5"
      : size === "lg"
        ? "text-[12px] px-3 py-1"
        : "text-[11px] px-2.5 py-0.5";

  const bgOverride = VARIANT_BG_OVERRIDE[variant];

  return (
    <span
      className={`inline-block font-bold rounded-pill ${sizeCls} ${VARIANT_CLS[variant]} ${className}`}
      style={bgOverride ? { background: bgOverride } : undefined}
    >
      {children}
    </span>
  );
}
