"use client";

import { useState, useRef, useEffect } from "react";
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
  MoreHorizontal,
  LogOut,
  UserCircle2,
  type LucideIcon,
} from "lucide-react";

/**
 * SAKURA OS PC サイドバー(REPORT3 ブランド版 / ライトテーマ)
 *
 * - 上部: REPORT3 ロゴ(グラデーション維持)+ サブタイトル
 * - 本体: フラットなメニュー(Lucide アイコン + ラベル)
 * - 開発者メニュー: system role のみ
 * - 下部: ユーザーアバター + 名前 + ロールのみ(チームレベル/安全度は廃止)
 *   サインアウト等は三点メニューで提供。
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

// フラットなメインメニュー
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
}: SidebarProps) {
  const pathname = usePathname();
  const isDev = role === "system";

  const visibleNav = NAV_ITEMS.filter((it) => !it.show || it.show(role));
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <aside
      aria-label="サイドナビゲーション"
      className="w-52 shrink-0 hidden md:flex flex-col bg-white border-r border-gray-200 sticky self-start top-0 h-screen"
    >
      {/* 上部: REPORT3 ロゴ(白背景上にブランドグラデ) */}
      <div className="px-4 py-4 border-b border-gray-100 shrink-0">
        <div
          className="text-[20px] font-extrabold leading-none tracking-tight bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--report3-from, #F5A45A) 0%, var(--report3-to, #E8516A) 100%)",
          }}
        >
          REPORT3
        </div>
        <div className="text-[10px] text-gray-500 mt-1 font-medium tracking-wide">
          SAKURA OS
        </div>
      </div>

      {/* スクロール領域 */}
      <nav
        role="navigation"
        className="flex-1 overflow-y-auto py-3 sidebar-scroll"
      >
        <ul className="space-y-0.5 px-2">
          {visibleNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={item.match(pathname)}
            />
          ))}
        </ul>

        {isDev && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            <div className="px-4 mb-1.5 flex items-center gap-2 text-[10px] font-bold tracking-wider text-amber-600">
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

      {/* フッター: アバター + 名前 + ロール + 三点メニュー */}
      <SidebarFooter
        displayName={displayName}
        roleLabel={roleLabel}
        initials={initials}
        canEditBranding={["office", "ceo", "system"].includes(role)}
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

  const activeClass = isDev
    ? "bg-amber-50 text-amber-700 font-semibold"
    : "bg-blue-50 text-blue-700 font-semibold";
  const inactiveClass = "text-gray-700 hover:bg-gray-50 hover:text-gray-900";

  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
          active ? activeClass : inactiveClass
        }`}
      >
        <Icon
          className="w-4 h-4 flex-shrink-0"
          strokeWidth={active ? 2.25 : 2}
          aria-hidden
        />
        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  );
}

function SidebarFooter({
  displayName,
  roleLabel,
  initials,
  canEditBranding,
}: {
  displayName: string;
  roleLabel: string;
  initials: string;
  canEditBranding: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // クリックアウト/ESC で閉じる
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="border-t border-gray-100 px-3 py-3 flex items-center gap-2.5 relative">
      <div
        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
        aria-hidden
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-gray-800 truncate">
          {displayName}
        </div>
        <div className="text-[10px] text-gray-500 truncate">{roleLabel}</div>
      </div>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="ユーザーメニューを開く"
          className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-50 transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" aria-hidden />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 bottom-full mb-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
          >
            <Link
              href="/pc/profile"
              role="menuitem"
              className="flex items-center gap-2 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <UserCircle2 className="w-4 h-4" aria-hidden />
              プロフィール
            </Link>
            {canEditBranding && (
              <Link
                href="/pc/settings/branding"
                role="menuitem"
                className="flex items-center gap-2 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                <SlidersHorizontal className="w-4 h-4" aria-hidden />
                外観設定
              </Link>
            )}
            <div className="border-t border-gray-100 my-1" />
            <form action="/sign-out" method="post" role="none">
              <button
                type="submit"
                role="menuitem"
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" aria-hidden />
                サインアウト
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
