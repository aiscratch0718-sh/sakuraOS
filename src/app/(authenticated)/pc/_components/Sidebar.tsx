"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  CheckSquare,
  ClipboardEdit,
  FileText,
  Home,
  LogOut,
  MapPin,
  MoreHorizontal,
  Settings,
  SlidersHorizontal,
  Smartphone,
  Trophy,
  Truck,
  User,
  UserCircle2,
  Wrench,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
  show?: (role: string) => boolean;
  badge?: string;
};

const allRoles = () => true;
const officePlus = (role: string) =>
  ["office", "ceo", "system"].includes(role);
const leaderPlus = (role: string) =>
  ["leader", "office", "ceo", "system"].includes(role);

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
    show: officePlus,
  },
  {
    href: "/pc/gaikyo",
    label: "工事概況",
    icon: BarChart3,
    match: (p) => p.startsWith("/pc/gaikyo"),
    show: officePlus,
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
    badge: "12",
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
    href: "/sp/tools",
    label: "SP 工具",
    icon: Wrench,
    match: (p) => p.startsWith("/sp/tools"),
  },
  {
    href: "/sp/profile",
    label: "SP プロフィール",
    icon: User,
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
  tagline = "業務管理システム",
}: SidebarProps) {
  const pathname = usePathname();
  const isDev = role === "system";
  const visibleNav = NAV_ITEMS.filter((it) => !it.show || it.show(role));
  const initials = displayName.slice(0, 1).toUpperCase();
  const brandName = tenantName.includes("REPORT3") ? tenantName : "REPORT3";

  return (
    <aside
      aria-label="サイドナビゲーション"
      className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-slate-200 bg-white md:flex"
    >
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-2 text-blue-700">
          <Building2 className="h-7 w-7" strokeWidth={2.2} aria-hidden />
          <div>
            <div className="text-[26px] font-black leading-none tracking-normal">
              {brandName}
            </div>
            <div className="mt-1 text-[12px] font-bold text-slate-700">
              {tagline}
            </div>
          </div>
        </div>
      </div>

      <nav role="navigation" className="sidebar-scroll flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-4">
          {visibleNav.map((item) => (
            <NavLink key={item.href} item={item} active={item.match(pathname)} />
          ))}
        </ul>

        {isDev && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="px-6 pb-2 text-[11px] font-bold text-amber-700">
              開発者メニュー
            </div>
            <ul className="space-y-1 px-4">
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

      <SidebarFooter
        displayName={displayName}
        roleLabel={roleLabel}
        initials={initials}
        canEditBranding={officePlus(role)}
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
    ? "bg-amber-50 text-amber-800 font-bold"
    : "bg-blue-700 text-white font-bold shadow-sm";
  const inactiveClass = "text-slate-700 hover:bg-slate-50 hover:text-slate-950";

  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`flex min-h-[42px] items-center gap-3 rounded-md px-3 text-[15px] transition-colors ${
          active ? activeClass : inactiveClass
        }`}
      >
        <Icon
          className="h-[18px] w-[18px] flex-shrink-0"
          strokeWidth={active ? 2.35 : 2}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
            {item.badge}
          </span>
        )}
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
    <div className="relative flex items-center gap-3 border-t border-slate-100 px-5 py-4">
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[13px] font-bold text-slate-600"
        aria-hidden
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-bold text-slate-800">
          {displayName}
        </div>
        <div className="truncate text-[11px] text-slate-500">{roleLabel}</div>
      </div>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="ユーザーメニューを開く"
          className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute bottom-full right-0 z-50 mb-2 w-44 rounded-md border border-slate-200 bg-white py-1 shadow-lg"
          >
            <Link
              href="/pc/profile"
              role="menuitem"
              className="flex items-center gap-2 px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              <UserCircle2 className="h-4 w-4" aria-hidden />
              プロフィール
            </Link>
            {canEditBranding && (
              <Link
                href="/pc/settings/branding"
                role="menuitem"
                className="flex items-center gap-2 px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                外観設定
              </Link>
            )}
            <div className="my-1 border-t border-slate-100" />
            <form action="/sign-out" method="post" role="none">
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                サインアウト
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
