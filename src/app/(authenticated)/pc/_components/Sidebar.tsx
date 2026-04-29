"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  match: (pathname: string) => boolean;
  show?: (role: string) => boolean;
};

const ITEMS: NavItem[] = [
  {
    href: "/pc/home",
    label: "ダッシュボード",
    icon: "🏠",
    match: (p) => p === "/pc/home",
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
    href: "/pc/tools",
    label: "工具管理",
    icon: "🛠️",
    match: (p) => p.startsWith("/pc/tools"),
  },
  {
    href: "/pc/vehicles",
    label: "車両管理",
    icon: "🚗",
    match: (p) => p.startsWith("/pc/vehicles") || p.startsWith("/pc/vehicle-runs"),
  },
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
];

// 開発者(system ロール)専用: モバイル UI への直行リンク
const DEV_ITEMS: NavItem[] = [
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

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const visible = ITEMS.filter((item) => !item.show || item.show(role));
  const isDev = role === "system";

  return (
    <aside
      aria-label="サイドナビゲーション"
      className="w-52 shrink-0 bg-white border-r border-line min-h-[calc(100vh-56px)] py-5 hidden md:block"
    >
      <ul className="space-y-1 px-3">
        {visible.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-btn text-[13px] font-bold transition-colors ${
                  active
                    ? "bg-blue-bg text-blue"
                    : "text-ink-2 hover:bg-graybg"
                }`}
              >
                <span aria-hidden className="text-[15px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* 開発者専用: モバイル UI への直行リンク */}
      {isDev && (
        <>
          <div className="mt-6 px-6">
            <p className="text-[10px] text-purple font-bold tracking-wider mb-2 flex items-center gap-1">
              <span aria-hidden>🔧</span> 開発者メニュー
            </p>
          </div>
          <ul className="space-y-1 px-3">
            {DEV_ITEMS.map((item) => {
              const active = item.match(pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-btn text-[12px] font-bold transition-colors ${
                      active
                        ? "bg-purple-bg text-purple"
                        : "text-ink-2 hover:bg-purple-bg/50"
                    }`}
                  >
                    <span aria-hidden className="text-[14px]">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="mt-8 px-6">
        <p className="text-[10px] text-ink-3 leading-relaxed">
          Phase B(MVP骨格)
          <br />
          工事概況表・原価管理・工具管理は Beta(第3段階)で追加します。
        </p>
      </div>
    </aside>
  );
}
