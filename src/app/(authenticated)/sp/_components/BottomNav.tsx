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
    href: "/sp/home",
    label: "ホーム",
    icon: "🏠",
    match: (p) => p === "/sp/home",
  },
  {
    href: "/sp/report3/new",
    label: "日報",
    icon: "📝",
    match: (p) => p.startsWith("/sp/report3"),
  },
  {
    href: "/sp/approvals",
    label: "承認",
    icon: "✓",
    match: (p) => p.startsWith("/sp/approvals"),
    show: (role) => ["leader", "office", "ceo", "system"].includes(role),
  },
  {
    href: "/pc/home",
    label: "PCへ",
    icon: "🖥️",
    match: () => false,
    show: (role) => role === "system",
  },
  {
    href: "/sp/profile",
    label: "プロフィール",
    icon: "👤",
    match: (p) => p.startsWith("/sp/profile"),
  },
];

export function BottomNav({ role }: { role: string }) {
  const pathname = usePathname();
  const visible = ITEMS.filter((item) => !item.show || item.show(role));

  // 列数は表示項目数に応じて動的に(4 or 5)
  const cols = visible.length >= 5 ? "grid-cols-5" : "grid-cols-4";

  return (
    <nav
      aria-label="メインナビゲーション"
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-line z-30"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className={`grid ${cols} max-w-md mx-auto`}>
        {visible.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 text-[10px] font-bold transition-colors ${
                  active
                    ? "text-blue"
                    : "text-ink-3 hover:text-ink-2"
                }`}
              >
                <span aria-hidden className="text-[18px] leading-none mb-0.5">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
        {/* 不足分を埋めるためのパディング */}
        {visible.length < 4 &&
          Array.from({ length: 4 - visible.length }).map((_, i) => (
            <li key={`pad-${i}`} aria-hidden />
          ))}
      </ul>
    </nav>
  );
}
