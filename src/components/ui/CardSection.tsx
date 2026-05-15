import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * 共通カードセクション。
 *
 * 用途: 各画面で「タイトル + アイコン + ヘッダー右側スロット + 本体」の
 * パネルを作るときに使う wrapper。
 *
 * 構成:
 *  - 上部: タイトル + アイコン + 右側スロット(任意)+ border-b 区切り
 *  - 本体: children
 *  - sticky: sticky top-3 を付けると右パネルなどで使える
 *
 * @example
 * <CardSection
 *   title="案件情報"
 *   icon={ClipboardList}
 *   headerRight={<button>編集</button>}
 * >
 *   <table>...</table>
 * </CardSection>
 */
export function CardSection({
  title,
  icon: Icon,
  iconColor = "text-blue-600",
  headerRight,
  sticky = false,
  visible = true,
  className = "",
  children,
}: {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  headerRight?: ReactNode;
  sticky?: boolean;
  /** false で非表示(タブ切替などで条件レンダリングする用途) */
  visible?: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (!visible) return null;
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white p-3 ${
        sticky ? "sticky top-3" : ""
      } ${className}`}
    >
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          {Icon && <Icon className={`h-3.5 w-3.5 ${iconColor}`} aria-hidden />}
          {title}
        </h2>
        {headerRight}
      </div>
      {children}
    </section>
  );
}
