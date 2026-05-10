"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardEdit,
  Briefcase,
  FileText,
  Calculator,
  BarChart3,
  Calendar,
  MapPin,
  Truck,
  Trophy,
  Bell,
  Settings,
  SlidersHorizontal,
  Wrench,
  Smartphone,
  CheckSquare,
  User,
  type LucideIcon,
} from "lucide-react";
import { SidebarFooterWidget } from "@/components/feature/SidebarFooterWidget";

/**
 * SAKURA OS PC サイドバー(REPORT3 ブランド版)
 *
 * 参照画像「ダッシュボード.png」準拠でフラットメニュー構成。
 * カテゴリ別アコーディオン構造は廃止し、ロール別表示制御のみ維持。
 *
 * - 上部: REPORT3 ロゴ + 「業務管理システム」サブタイトル
 * - 本体: フラットなメニュー(Lucide アイコン + ラベル)
 * - 開発者メニュー: system role のみ(SP 画面直行リンク群)
 * - 下部: SidebarFooterWidget(チームレベル + ユーザー情報)
 */

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
  show?: (role: string) => boolean;
};

// ロール別表示ヘルパ
const allRoles = () => true;
const officePlus = (role: string) =>
  ["office", "ceo", "system"].includes(role);
const officeCeoOnly = (role: string) =>
  ["office", "ceo", "system"].includes(role);
const leaderPlus = (role: string) =>
  ["leader", "office", "ceo", "system"].includes(role);

// フラットなメインメニュー(参照画像準拠)
const NAV_ITEMS: NavItem[] = [
  {
    href: "/pc/home",
    label: "ホーム",
    icon: Home,
    match: (p) => p === "/pc/home",
    show: allRoles,
  },
  {
    href: "/sp/report3/new",
    label: "REPORT3入力",
    icon: ClipboardEdit,
    match: (p) => p.startsWith("/sp/report3"),
    show: allRoles,
  },
  {
    href: "/pc/projects",
    label: "案件管理",
    icon: Briefcase,
    match: (p) => p.startsWith("/pc/projects"),
    show: allRoles,
  },
  {
    href: "/pc/estimates",
    label: "見積・請求",
    icon: FileText,
    match: (p) =>
      p.startsWith("/pc/estimates") ||
      p.startsWith("/pc/invoices") ||
      p.startsWith("/pc/payments"),
    show: officePlus,
  },
  {
    href: "/pc/cost",
    label: "原価管理",
    icon: Calculator,
    match: (p) => p.startsWith("/pc/cost"),
    show: officeCeoOnly,
  },
  {
    href: "/pc/gaikyo",
    label: "工事概況",
    icon: BarChart3,
    match: (p) => p.startsWith("/pc/gaikyo"),
    show: officeCeoOnly,
  },
  {
    href: "/pc/schedules",
    label: "スケジュール",
    icon: Calendar,
    match: (p) => p.startsWith("/pc/schedules"),
    show: allRoles,
  },
  {
    href: "/pc/dispatch-map",
    label: "配置マップ",
    icon: MapPin,
    match: (p) => p.startsWith("/pc/dispatch-map"),
    show: allRoles,
  },
  {
    href: "/pc/fleet",
    label: "車両・工具",
    icon: Truck,
    match: (p) =>
      p.startsWith("/pc/fleet") ||
      p.startsWith("/pc/vehicles") ||
      p.startsWith("/pc/tools"),
    show: leaderPlus,
  },
  {
    href: "/pc/quests-badges",
    label: "クエスト・バッジ",
    icon: Trophy,
    match: (p) =>
      p.startsWith("/pc/quests-badges") ||
      p.startsWith("/pc/gamification") ||
      p.startsWith("/pc/points"),
    show: allRoles,
  },
  {
    href: "/pc/notifications",
    label: "通知",
    icon: Bell,
    match: (p) => p.startsWith("/pc/notifications"),
    show: allRoles,
  },
  {
    href: "/pc/masters",
    label: "マスタ管理",
    icon: Settings,
    match: (p) =>
      p.startsWith("/pc/masters") ||
      p.startsWith("/pc/customers") ||
      p.startsWith("/pc/users") ||
      p.startsWith("/pc/price-items") ||
      p.startsWith("/pc/qualifications") ||
      p.startsWith("/pc/work-classifications") ||
      p.startsWith("/pc/org-departments") ||
      p.startsWith("/pc/org-positions"),
    show: officePlus,
  },
  {
    href: "/pc/settings/branding",
    label: "設定",
    icon: SlidersHorizontal,
    match: (p) => p.startsWith("/pc/settings"),
    show: officePlus,
  },
];

// 開発者(system role)専用: モバイル UI への直行リンク
const DEV_ITEMS: NavItem[] = [
  {
    href: "/sp/home",
    label: "SP ホーム",
    icon: Smartphone,
    match: (p) => p === "/sp/home",
  },
  {
    href: "/sp/report3/new",
    label: "SP 日報入力",
    icon: ClipboardEdit,
    match: (p) => p.startsWith("/sp/report3/new"),
  },
  {
    href: "/sp/approvals",
    label: "SP 承認待ち",
    icon: CheckSquare,
    match: (p) => p.startsWith("/sp/approvals"),
  },
  {
    href: "/sp/gamification",
    label: "SP ランク",
    icon: Trophy,
    match: (p) => p.startsWith("/sp/gamification"),
  },
  {
    href: "/sp/tools",
    label: "SP 工具",
    icon: Wrench,
    match: (p) => p.startsWith("/sp/tools"),
  },
  {
    href: "/sp/vehicle-runs",
    label: "SP 車両運行",
    icon: Truck,
    match: (p) => p.startsWith("/sp/vehicle-runs"),
  },
  {
    href: "/sp/profile",
    label: "SP プロフィール",
    icon: User,
    match: (p) => p === "/sp/profile",
  },
];

// Props 互換のため tenantName / tagline / logoUrl は残すが未使用
type SidebarProps = {
  role: string;
  displayName: string;
  roleLabel: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tenantName: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tagline?: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logoUrl?: string | null;
};

export function Sidebar({
  role,
  displayName,
  roleLabel,
  // tenantName / tagline / logoUrl は REPORT3 ブランド固定化のため未使用
  // (Props 型は layout.tsx との互換のため維持)
}: SidebarProps) {
  const pathname = usePathname();
  const isDev = role === "system";

  const visibleNav = NAV_ITEMS.filter((it) => !it.show || it.show(role));

  return (
    <aside
      aria-label="サイドナビゲーション"
      className="w-52 shrink-0 hidden md:flex flex-col text-white sticky self-start top-0 h-screen"
      style={{
        background:
          "linear-gradient(180deg, #0f1e3c 0%, #0a1730 60%, #07122a 100%)",
      }}
    >
      {/* 上部: REPORT3 ロゴ */}
      <div className="px-3 py-3 border-b border-white/10 shrink-0">
        <div
          className="text-[22px] font-extrabold leading-none tracking-tight bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--report3-from, #F5A45A) 0%, var(--report3-to, #E8516A) 100%)",
          }}
        >
          REPORT3
        </div>
        <div className="text-[10px] text-white/55 mt-1 font-medium tracking-wide">
          業務管理システム
        </div>
      </div>

      {/* スクロール領域 */}
      <nav
        role="navigation"
        className="flex-1 overflow-y-auto py-2 sidebar-scroll"
      >
        {/* フラットメニュー(カテゴリ無し) */}
        <ul className="space-y-0.5 px-2">
          {visibleNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={item.match(pathname)}
            />
          ))}
        </ul>

        {/* 開発者メニュー (system role のみ) */}
        {isDev && (
          <div className="mt-4 border-t border-white/10 pt-3">
            <div className="px-4 mb-1.5 flex items-center gap-2 text-[10px] font-bold tracking-wider text-amber/90">
              <span aria-hidden>🔧</span>
              <span>開発者メニュー</span>
            </div>
            <ul className="space-y-0.5 px-2">
              {DEV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={item.match(pathname)}
                  variant="dev"
                />
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* 下部: チームレベル + ユーザー情報 + アバターメニュー(プロフィール/外観設定/サインアウト) */}
      <SidebarFooterWidget
        user={{
          displayName,
          role: roleLabel,
          avatarText: displayName.slice(0, 1),
          canEditBranding: ["office", "ceo", "system"].includes(role),
        }}
        team={{
          name: "全社",
          progressPercent: 65,
          safetyScore: 80,
        }}
      />
    </aside>
  );
}

function NavLink({
  item,
  active,
  variant,
}: {
  item: NavItem;
  active: boolean;
  variant?: "dev";
}) {
  const Icon = item.icon;
  const isDev = variant === "dev";

  // ベース色 / 状態色の整理
  const inactiveColor = isDev ? "text-amber/85" : "text-white/75";
  const hover = "hover:bg-white/10 hover:text-white";
  const activeClass = isDev
    ? "bg-amber/15 text-amber font-bold"
    : "bg-white/15 text-white font-bold";

  return (
    <li className="relative">
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
          active ? activeClass : `${inactiveColor} ${hover}`
        }`}
      >
        {/* 左 3px の brand.report3 アクセントバー (アクティブ時のみ) */}
        {active && !isDev && (
          <span
            aria-hidden
            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-sm"
            style={{
              background:
                "linear-gradient(180deg, var(--report3-from, #F5A45A) 0%, var(--report3-to, #E8516A) 100%)",
            }}
          />
        )}
        <Icon
          size={16}
          strokeWidth={active ? 2.25 : 2}
          aria-hidden
          className="flex-shrink-0"
        />
        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  );
}
