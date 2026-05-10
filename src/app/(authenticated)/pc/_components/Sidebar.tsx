"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SubItem = {
  href: string;
  label: string;
  icon: string;
  match: (pathname: string) => boolean;
  show?: (role: string) => boolean;
};

type Section = {
  id: string;
  title: string;
  icon: string;
  items: SubItem[];
};

// 常時 1 番上に固定で出す項目
const TOP_ITEMS: SubItem[] = [
  {
    href: "/pc/home",
    label: "ダッシュボード",
    icon: "🏠",
    match: (p) => p === "/pc/home",
  },
];

// カテゴリ別グループ
const SECTIONS: Section[] = [
  {
    id: "daily",
    title: "業務オペレーション",
    icon: "📋",
    items: [
      {
        href: "/pc/notifications",
        label: "通知",
        icon: "🔔",
        match: (p) => p.startsWith("/pc/notifications"),
      },
      {
        href: "/pc/reports",
        label: "日報一覧",
        icon: "📋",
        match: (p) => p.startsWith("/pc/reports"),
      },
      {
        href: "/pc/approvals",
        label: "承認待ち",
        icon: "✓",
        match: (p) => p.startsWith("/pc/approvals"),
      },
      {
        href: "/pc/incidents",
        label: "ヒヤリハット",
        icon: "⚠",
        match: (p) => p.startsWith("/pc/incidents"),
      },
    ],
  },
  {
    id: "sales",
    title: "営業・売上",
    icon: "💴",
    items: [
      {
        href: "/pc/estimates",
        label: "見積",
        icon: "📝",
        match: (p) => p.startsWith("/pc/estimates"),
      },
      {
        href: "/pc/invoices",
        label: "請求書",
        icon: "🧾",
        match: (p) => p.startsWith("/pc/invoices"),
      },
      {
        href: "/pc/payments",
        label: "入金管理",
        icon: "💴",
        match: (p) => p.startsWith("/pc/payments"),
      },
      {
        href: "/pc/customer-sales",
        label: "客先別売上",
        icon: "📈",
        match: (p) => p.startsWith("/pc/customer-sales"),
      },
    ],
  },
  {
    id: "expense",
    title: "経費・書類",
    icon: "💼",
    items: [
      {
        href: "/pc/receipts",
        label: "領収書管理",
        icon: "🧾",
        match: (p) => p.startsWith("/pc/receipts"),
      },
      {
        href: "/pc/supplier-invoices",
        label: "仕入先請求書",
        icon: "📄",
        match: (p) => p.startsWith("/pc/supplier-invoices"),
      },
      {
        href: "/pc/expense",
        label: "経費管理表",
        icon: "💼",
        match: (p) => p.startsWith("/pc/expense"),
      },
      {
        href: "/pc/safety-documents",
        label: "安全書類",
        icon: "📑",
        match: (p) => p.startsWith("/pc/safety-documents"),
        show: (role) => ["leader", "office", "ceo", "system"].includes(role),
      },
      {
        href: "/pc/contractor-templates",
        label: "元請テンプレート",
        icon: "📁",
        match: (p) => p.startsWith("/pc/contractor-templates"),
        show: (role) => ["office", "ceo", "system"].includes(role),
      },
    ],
  },
  {
    id: "equipment",
    title: "設備管理",
    icon: "🛠️",
    items: [
      {
        href: "/pc/tools",
        label: "工具管理",
        icon: "🛠️",
        match: (p) => p.startsWith("/pc/tools"),
      },
      {
        href: "/pc/vehicles",
        label: "車両管理",
        icon: "🚗",
        match: (p) =>
          p.startsWith("/pc/vehicles") || p.startsWith("/pc/vehicle-runs"),
      },
    ],
  },
  {
    id: "master",
    title: "マスタ管理",
    icon: "🗂️",
    items: [
      {
        href: "/pc/projects",
        label: "現場マスタ",
        icon: "🏗️",
        match: (p) => p.startsWith("/pc/projects"),
      },
      {
        href: "/pc/customers",
        label: "客先マスタ",
        icon: "🤝",
        match: (p) => p.startsWith("/pc/customers"),
      },
      {
        href: "/pc/users",
        label: "ユーザー管理",
        icon: "👥",
        match: (p) => p.startsWith("/pc/users"),
      },
      {
        href: "/pc/price-items",
        label: "単価マスタ",
        icon: "💰",
        match: (p) => p.startsWith("/pc/price-items"),
      },
      {
        href: "/pc/qualifications",
        label: "資格マスタ",
        icon: "🎓",
        match: (p) => p.startsWith("/pc/qualifications"),
      },
      {
        href: "/pc/work-classifications",
        label: "工種マスタ",
        icon: "🏷️",
        match: (p) => p.startsWith("/pc/work-classifications"),
      },
      {
        href: "/pc/org-departments",
        label: "部署マスタ",
        icon: "🏢",
        match: (p) => p.startsWith("/pc/org-departments"),
      },
      {
        href: "/pc/org-positions",
        label: "役職マスタ",
        icon: "🎖️",
        match: (p) => p.startsWith("/pc/org-positions"),
      },
    ],
  },
  {
    id: "other",
    title: "その他",
    icon: "⚙️",
    items: [
      {
        href: "/pc/gamification",
        label: "ランキング",
        icon: "🏆",
        match: (p) => p.startsWith("/pc/gamification"),
      },
      {
        href: "/pc/profile",
        label: "プロフィール",
        icon: "👤",
        match: (p) => p.startsWith("/pc/profile"),
      },
      {
        href: "/pc/settings/branding",
        label: "外観設定",
        icon: "🎨",
        match: (p) => p.startsWith("/pc/settings/branding"),
        show: (role) => ["office", "ceo", "system"].includes(role),
      },
    ],
  },
];

// 開発者(system ロール)専用: モバイル UI への直行リンク
const DEV_ITEMS: SubItem[] = [
  {
    href: "/sp/home",
    label: "SP ホーム",
    icon: "📱",
    match: (p) => p === "/sp/home",
  },
  {
    href: "/sp/report3/new",
    label: "SP 日報入力",
    icon: "📝",
    match: (p) => p.startsWith("/sp/report3/new"),
  },
  {
    href: "/sp/approvals",
    label: "SP 承認待ち",
    icon: "✓",
    match: (p) => p.startsWith("/sp/approvals"),
  },
  {
    href: "/sp/gamification",
    label: "SP ランク",
    icon: "🏆",
    match: (p) => p.startsWith("/sp/gamification"),
  },
  {
    href: "/sp/tools",
    label: "SP 工具",
    icon: "🛠️",
    match: (p) => p.startsWith("/sp/tools"),
  },
  {
    href: "/sp/vehicle-runs",
    label: "SP 車両運行",
    icon: "🚗",
    match: (p) => p.startsWith("/sp/vehicle-runs"),
  },
  {
    href: "/sp/profile",
    label: "SP プロフィール",
    icon: "👤",
    match: (p) => p === "/sp/profile",
  },
];

type SidebarProps = {
  role: string;
  displayName: string;
  roleLabel: string;
  tenantName: string;
  tagline?: string;
  logoUrl?: string | null;
};

export function Sidebar({
  role,
  displayName,
  roleLabel,
  tenantName,
  tagline,
  logoUrl,
}: SidebarProps) {
  const pathname = usePathname();
  const initial = displayName.slice(0, 1);
  const isDev = role === "system";

  return (
    <aside
      aria-label="サイドナビゲーション"
      className="w-60 shrink-0 hidden md:flex flex-col text-white sticky self-start top-[56px] h-[calc(100vh-56px)]"
      style={{
        background:
          "linear-gradient(180deg, #0f1e3c 0%, #0a1730 60%, #07122a 100%)",
      }}
    >
      {/* ロゴ + 会社名 */}
      <div className="px-4 py-4 border-b border-white/10 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-white/20">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="ロゴ"
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-[14px] font-extrabold text-navy">
              {tenantName.slice(0, 2)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-[13px] leading-tight truncate">
            {tenantName}
          </div>
          {tagline && (
            <div className="text-[10px] text-white/55 leading-tight mt-0.5 truncate">
              {tagline}
            </div>
          )}
        </div>
      </div>

      {/* スクロール領域 */}
      <nav className="flex-1 overflow-y-auto py-3 sidebar-scroll">
        {/* トップレベル(ダッシュボード) */}
        <ul className="space-y-0.5 px-3 mb-3">
          {TOP_ITEMS.map((item) => {
            if (item.show && !item.show(role)) return null;
            return (
              <NavLink
                key={item.href}
                item={item}
                active={item.match(pathname)}
                size="lg"
              />
            );
          })}
        </ul>

        {/* セクション */}
        {SECTIONS.map((section) => {
          const visible = section.items.filter(
            (it) => !it.show || it.show(role),
          );
          if (visible.length === 0) return null;
          return (
            <div key={section.id} className="mb-3">
              <div className="px-4 mb-1 flex items-center gap-2 text-[10px] font-bold tracking-wider text-white/50">
                <span aria-hidden className="text-[12px]">
                  {section.icon}
                </span>
                <span>{section.title}</span>
              </div>
              <ul className="space-y-0.5 px-3">
                {visible.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={item.match(pathname)}
                    size="sm"
                  />
                ))}
              </ul>
            </div>
          );
        })}

        {/* 開発者メニュー */}
        {isDev && (
          <div className="mb-3 mt-2 border-t border-white/10 pt-3">
            <div className="px-4 mb-1 flex items-center gap-2 text-[10px] font-bold tracking-wider text-amber/90">
              <span aria-hidden>🔧</span>
              <span>開発者メニュー</span>
            </div>
            <ul className="space-y-0.5 px-3">
              {DEV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={item.match(pathname)}
                  size="sm"
                  variant="dev"
                />
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* 下部: ユーザー情報 */}
      <div className="border-t border-white/10 px-3 py-3 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-[13px] flex-shrink-0 ring-1 ring-white/20">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold truncate">{displayName}</div>
          <div className="text-[10px] text-white/60 truncate">{roleLabel}</div>
        </div>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
  size,
  variant,
}: {
  item: SubItem;
  active: boolean;
  size: "lg" | "sm";
  variant?: "dev";
}) {
  const padY = size === "lg" ? "py-2.5" : "py-1.5";
  const fontSize = size === "lg" ? "text-[13px]" : "text-[12px]";
  const baseColor =
    variant === "dev" ? "text-amber/85" : active ? "text-white" : "text-white/75";
  const activeBg =
    variant === "dev"
      ? "bg-amber/15 text-amber"
      : "bg-white/15 text-white shadow-[inset_2px_0_0_0_rgba(255,255,255,0.7)]";
  const hover = "hover:bg-white/10 hover:text-white";

  return (
    <li>
      <Link
        href={item.href}
        className={`flex items-center gap-2.5 px-3 ${padY} rounded-md ${fontSize} font-medium transition-colors ${
          active ? activeBg : `${baseColor} ${hover}`
        }`}
      >
        <span
          aria-hidden
          className={`${size === "lg" ? "text-[15px]" : "text-[13px]"} w-4 text-center flex-shrink-0`}
        >
          {item.icon}
        </span>
        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  );
}
