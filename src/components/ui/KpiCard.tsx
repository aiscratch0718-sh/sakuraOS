import type { ReactNode } from "react";

export type KpiAccent = "p1" | "p2" | "p3" | "p4" | "gold" | "blue";

type AccentStyle = {
  /** 左 4px の縦アクセントバーの色 */
  barColor: string;
  /** タイトル色 */
  titleColor: string;
};

const ACCENT: Record<KpiAccent, AccentStyle> = {
  p1: {
    barColor: "bg-red-400",
    titleColor: "text-red-600",
  },
  p2: {
    barColor: "bg-amber-400",
    titleColor: "text-amber-600",
  },
  p3: {
    barColor: "bg-teal-400",
    titleColor: "text-teal-600",
  },
  p4: {
    barColor: "bg-purple-400",
    titleColor: "text-purple-600",
  },
  gold: {
    barColor: "bg-yellow-400",
    titleColor: "text-yellow-600",
  },
  blue: {
    barColor: "bg-blue-400",
    titleColor: "text-blue-600",
  },
};

/**
 * コーポレート系ライトテーマの KPI カード。
 *
 * - 背景: 白 / 細グレー罫線 / 軽い影
 * - 左 4px の縦アクセントバーでカテゴリ色を表現
 * - タイトルだけアクセント色、その他はグレースケール
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
    <div className="relative overflow-hidden bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm transition-shadow hover:shadow">
      {/* 左 4px の縦アクセントバー */}
      <div
        aria-hidden
        className={`absolute left-0 top-0 bottom-0 w-1 ${a.barColor}`}
      />

      {/* ヘッダー: タイトル + ヘルプ ? */}
      <div className="flex items-center gap-1 mb-1">
        <h3 className={`text-[12px] font-bold ${a.titleColor}`}>{label}</h3>
        <button
          type="button"
          aria-label={`${label}の説明`}
          className="w-3.5 h-3.5 rounded-full border border-gray-300 text-gray-400 text-[9px] flex items-center justify-center hover:bg-gray-100 transition-colors leading-none"
          tabIndex={-1}
        >
          ?
        </button>
      </div>

      {/* メイン: 巨大な数値 + 任意の side widget(children) */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="text-[34px] font-black leading-none tracking-tight text-gray-900">
          {value}
          {unit && (
            <span className="text-[16px] font-extrabold ml-0.5">{unit}</span>
          )}
        </div>
        {children && <div className="flex-shrink-0">{children}</div>}
      </div>

      {/* サブテキスト */}
      {subText && (
        <div className="text-[10px] text-gray-500 mb-1.5 leading-snug">
          {subText}
        </div>
      )}

      {/* フッター: トレンド(左) + 詳細リンク(右) */}
      {(trend || href) && (
        <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
          <div className="text-[10px] flex items-center gap-1">
            {trend && (
              <>
                <span className="text-gray-500">
                  {trend.comparison ?? "前日比"}
                </span>
                <span
                  className={
                    trend.dir === "up"
                      ? "text-green-600 font-bold"
                      : trend.dir === "down"
                        ? "text-red-600 font-bold"
                        : "text-gray-500 font-bold"
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
              className="text-[10px] font-bold text-gray-500 hover:text-gray-700 hover:underline flex items-center gap-0.5"
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
