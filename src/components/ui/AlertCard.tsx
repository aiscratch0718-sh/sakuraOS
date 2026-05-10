import Link from "next/link";

/**
 * Severity スケール(参照画像 S5 由来 + 既存互換):
 * - critical: 緊急(赤背景白文字)
 * - active:   進行中・要対応(赤系)
 * - warn:     注意(茶金)
 * - info:     情報(青)
 * - p1/p2/blue: 旧名(後方互換、内部マップで吸収)
 */
export type AlertSeverity =
  | "critical"
  | "active"
  | "warn"
  | "info"
  | "p1" // 旧 = active
  | "p2" // 旧 = warn
  | "blue"; // 旧 = info

const SEVERITY_BG: Record<AlertSeverity, string> = {
  critical: "bg-red text-white",
  active: "bg-red/10 text-red",
  warn: "bg-amber/10 text-amber",
  info: "bg-blue/10 text-blue",
  p1: "bg-red/10 text-red",
  p2: "bg-amber/10 text-amber",
  blue: "bg-blue/10 text-blue",
};

const SEVERITY_DETAIL_COLOR: Record<AlertSeverity, string> = {
  critical: "text-red",
  active: "text-red",
  warn: "text-amber",
  info: "text-blue",
  p1: "text-red",
  p2: "text-amber",
  blue: "text-blue",
};

export type AlertItemProps = {
  icon: string;
  title: string;
  detail: string;
  severity?: AlertSeverity;
  href?: string;
};

/**
 * 個別アラート行。AlertCard の中で複数並べる想定。
 */
export function AlertItem({
  icon,
  title,
  detail,
  severity = "p1",
  href,
}: AlertItemProps) {
  const inner = (
    <div className="flex-1 min-w-[220px] bg-panel border border-line rounded-panel px-3 py-2.5 flex items-center gap-2.5 hover:shadow-card transition-shadow">
      <div
        aria-hidden
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[16px] shrink-0 ${SEVERITY_BG[severity]}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold text-ink truncate">{title}</div>
        <div
          className={`text-[10px] font-semibold truncate ${SEVERITY_DETAIL_COLOR[severity]}`}
        >
          {detail}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="contents">
        {inner}
      </Link>
    );
  }
  return inner;
}

/**
 * 要対応アラートカード。0件のときは何も描画しない。
 *
 * 例:
 * <AlertCard
 *   title="要対応アラート"
 *   items={[
 *     { icon: "📋", title: "資格期限切れ(2件)", detail: "佐藤: 玉掛け 11/20", severity: "p1", href: "/pc/qualifications" },
 *     ...
 *   ]}
 * />
 */
export function AlertCard({
  title = "要対応アラート",
  items,
  dataSource,
}: {
  title?: string;
  items: AlertItemProps[];
  dataSource?: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div
      className="rounded-cardLg border border-line border-l-[6px] border-l-status-active overflow-hidden shadow-card"
      style={{
        background:
          "linear-gradient(90deg, rgba(224,48,48,0.05), transparent 60%)",
      }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-2.5">
          <span aria-hidden className="text-[18px]">
            ⚠️
          </span>
          <span className="text-[13px] font-extrabold text-status-active">{title}</span>
          <span className="pill pill-active ml-1">{items.length}件</span>
          {dataSource && (
            <span className="ml-auto text-[10px] text-ink-3">
              データ元: {dataSource}
            </span>
          )}
        </div>
        <div className="flex gap-2.5 flex-wrap">
          {items.map((it, i) => (
            <AlertItem key={i} {...it} />
          ))}
        </div>
      </div>
    </div>
  );
}
