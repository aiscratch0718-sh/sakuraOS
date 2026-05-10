import type { ReactNode } from "react";

export type KpiAccent = "p1" | "p2" | "p3" | "p4" | "gold" | "blue";

type AccentStyle = {
  /** タイトル色 */
  titleColor: string;
  /** 数値色 */
  valueColor: string;
  /** 詳細リンク色 */
  linkColor: string;
  /** トレンド↑色(positive) */
  upColor: string;
  /** トレンド↓色(negative) */
  downColor: string;
};

const ACCENT: Record<KpiAccent, AccentStyle> = {
  p1: {
    titleColor: "text-red",
    valueColor: "text-ink",
    linkColor: "text-red",
    upColor: "text-status-done",
    downColor: "text-red",
  },
  p2: {
    titleColor: "text-amber",
    valueColor: "text-ink",
    linkColor: "text-amber",
    upColor: "text-status-done",
    downColor: "text-red",
  },
  p3: {
    titleColor: "text-teal",
    valueColor: "text-ink",
    linkColor: "text-teal",
    upColor: "text-status-done",
    downColor: "text-red",
  },
  p4: {
    titleColor: "text-purple",
    valueColor: "text-ink",
    linkColor: "text-purple",
    upColor: "text-status-done",
    downColor: "text-red",
  },
  gold: {
    titleColor: "text-amber",
    valueColor: "text-ink",
    linkColor: "text-amber",
    upColor: "text-status-done",
    downColor: "text-red",
  },
  blue: {
    titleColor: "text-blue",
    valueColor: "text-ink",
    linkColor: "text-blue",
    upColor: "text-status-done",
    downColor: "text-red",
  },
};

/**
 * 参照データ画像準拠の KPI カード。
 *
 * 構造(参照: 参照データ/ダッシュボード.png):
 *   ┌──────────────────────────────┐
 *   │  タイトル ❓                  │  ← header
 *   │                               │
 *   │  巨大な値                ◯   │  ← value + 任意の side widget(children)
 *   │                               │
 *   │  サブテキスト                  │  ← subText
 *   │                               │
 *   │  ↑ +12pt 前日比      詳細へ → │  ← footer
 *   └──────────────────────────────┘
 *
 * - icon prop は廃止予定(後方互換のため受け取るが無視)
 * - 色アクセントは titleColor + linkColor のみ(枠線・バーは無し)
 * - children は数値の右側に表示される(例: <MiniDonut>)
 */
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
  // 旧 props(後方互換のため受け取るが現状未使用)
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
  /** 詳細リンクのラベル。href ありで省略時 "詳細へ" */
  hrefLabel?: string;
  children?: ReactNode;
  /** @deprecated 参照画像準拠でアイコンは廃止。互換のため受け取るのみ */
  icon?: string;
}) {
  const a = ACCENT[accent];

  return (
    <div className="relative overflow-hidden bg-panel border border-line rounded-card px-3.5 py-2.5 shadow-card transition-all hover:shadow-cardHover">
      {/* ヘッダー: タイトル + ヘルプ ? */}
      <div className="flex items-center gap-1 mb-1">
        <h3 className={`text-[12px] font-bold ${a.titleColor}`}>{label}</h3>
        <button
          type="button"
          aria-label={`${label}の説明`}
          className="w-3.5 h-3.5 rounded-full border border-line text-ink-3 text-[9px] flex items-center justify-center hover:bg-graybg transition-colors leading-none"
          tabIndex={-1}
        >
          ?
        </button>
      </div>

      {/* メイン: 巨大な数値 + 任意の side widget(children) */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div
          className={`text-[34px] font-black leading-none tracking-tight ${a.valueColor}`}
        >
          {value}
          {unit && (
            <span className="text-[16px] font-extrabold ml-0.5">{unit}</span>
          )}
        </div>
        {children && <div className="flex-shrink-0">{children}</div>}
      </div>

      {/* サブテキスト */}
      {subText && (
        <div className="text-[10px] text-ink-3 mb-1.5 leading-snug">
          {subText}
        </div>
      )}

      {/* フッター: トレンド(左) + 詳細リンク(右) */}
      {(trend || href) && (
        <div className="flex items-center justify-between pt-1.5 border-t border-line/60">
          <div className="text-[10px] flex items-center gap-1">
            {trend && (
              <>
                <span className="text-ink-3">
                  {trend.comparison ?? "前日比"}
                </span>
                <span
                  className={
                    trend.dir === "up"
                      ? `${a.upColor} font-bold`
                      : trend.dir === "down"
                        ? `${a.downColor} font-bold`
                        : "text-ink-3 font-bold"
                  }
                >
                  {trend.dir === "up"
                    ? "↑"
                    : trend.dir === "down"
                      ? "↓"
                      : "→"}{" "}
                  {trend.value}
                </span>
              </>
            )}
          </div>
          {href && (
            <a
              href={href}
              className={`text-[10px] font-bold ${a.linkColor} hover:underline flex items-center gap-0.5`}
            >
              {hrefLabel ?? "詳細へ"}
              <span aria-hidden>›</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
