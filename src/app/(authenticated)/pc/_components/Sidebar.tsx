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
    href: "/pc/approvals",
    label: "承認待ち",
    icon: "✓",
    match: (p) => p.startsWith("/pc/approvals"),
  },
  {
    href: "/pc/projects",
    label: "現場一覧",
    icon: "🏗️",
    match: (p) => p.startsWith("/pc/projects"),
  },
  {
    href: "/pc/profile",
    label: "プロフィール",
    icon: "👤",
    match: (p) => p.startsWith("/pc/profile"),
  },
];

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const visible = ITEMS.filter((item) => !item.show || item.show(role));

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
