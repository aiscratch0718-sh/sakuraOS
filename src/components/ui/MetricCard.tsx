import type { LucideIcon } from "lucide-react";

/**
 * 共通コンパクト KPI カード(高さ 88px)。
 *
 * 用途: Phase 12 で各業務画面の上段に並べる統計カード。
 * 既存の `KpiCard`(114px、help button + trend + リンク付き、ダッシュボード用)
 * とは別系統。シンプルでコンパクトな表示が必要なフィルタ画面 / 詳細画面用。
 *
 * 構成:
 *  - 左に縦アクセントバー(border-l-4)
 *  - 上部: ラベル(左)+ アイコン(右)
 *  - 中央: 値(大きく)
 *  - 下部: サブテキスト(任意)
 *
 * 統一仕様(2026-05-14 デザイン総点検 S24 で策定):
 *  - 高さ: 88px
 *  - 角丸: rounded-lg
 *  - 縦アクセントバー: border-l-4 + accent クラス
 *  - 値フォント: text-lg font-bold
 *
 * @example
 * <MetricCard
 *   label="売上(累計)"
 *   value="¥150,910,000"
 *   subText="2026/1 〜 2026/9"
 *   icon={DollarSign}
 *   accent="border-l-blue-500"
 *   iconColor="text-blue-600"
 * />
 */
export function MetricCard({
  label,
  value,
  subText,
  icon: Icon,
  accent,
  iconColor,
}: {
  label: string;
  value: string | number;
  subText?: string;
  icon: LucideIcon;
  /** 縦アクセントバー色 (例: "border-l-blue-500") */
  accent: string;
  /** アイコン色 (例: "text-blue-600") */
  iconColor: string;
}) {
  return (
    <div
      className={`flex h-[88px] flex-col rounded-lg border border-slate-200 bg-white p-3 border-l-4 ${accent}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} aria-hidden />
      </div>
      <div className="mt-1 truncate text-lg font-bold leading-none text-slate-900">
        {value}
      </div>
      {subText && (
        <div className="mt-auto truncate text-[10px] text-slate-500">{subText}</div>
      )}
    </div>
  );
}
