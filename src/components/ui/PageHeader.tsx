import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type Breadcrumb = {
  label: string;
  href?: string;
};

/**
 * 共通ページヘッダー。
 *
 * 用途: 各 PC 画面 / SP 画面の最上部に配置するヘッダー。
 *
 * 構成:
 *  - 左:パンくず(任意)+ アイコン付き h1 + サブテキスト(任意)
 *  - 右:アクション slot(ボタン群など、任意)
 *
 * パンくずは「SAKURA OS / [親] / [現在画面]」のように複数階層を渡せる。
 * 末尾のパンくずは現在地として太字表示、その他は href があれば Link 化。
 *
 * @example
 * <PageHeader
 *   breadcrumbs={[{ label: "SAKURA OS" }, { label: "配置マップ" }]}
 *   icon={MapPin}
 *   iconColor="text-blue-600"
 *   title="配置マップ"
 *   subtitle="現場の位置情報と当日配置人員をマップで確認できます"
 *   actions={<button>...</button>}
 * />
 */
export function PageHeader({
  breadcrumbs,
  icon: Icon,
  iconColor = "text-blue-600",
  title,
  subtitle,
  actions,
}: {
  breadcrumbs?: Breadcrumb[];
  icon?: LucideIcon;
  iconColor?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="text-[11px] text-slate-500" aria-label="パンくず">
            {breadcrumbs.map((b, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <span key={i}>
                  {i > 0 && <span className="mx-1">/</span>}
                  {b.href && !isLast ? (
                    <a href={b.href} className="hover:underline">
                      {b.label}
                    </a>
                  ) : (
                    <span className={isLast ? "font-medium text-slate-700" : ""}>
                      {b.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        )}
        <h1 className="mt-0.5 flex items-center gap-2 text-base font-semibold text-slate-900">
          {Icon && <Icon className={`h-4 w-4 ${iconColor}`} aria-hidden />}
          <span>{title}</span>
          {subtitle && (
            <span className="truncate text-xs font-normal text-slate-500">
              {subtitle}
            </span>
          )}
        </h1>
      </div>
      {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
