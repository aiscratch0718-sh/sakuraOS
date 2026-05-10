import Link from "next/link";

const LINKS = [
  { href: "/sp/report3", icon: "📋", label: "REPORT3 入力" },
  { href: "/pc/projects", icon: "🏗️", label: "案件一覧" },
  { href: "/pc/estimates/new", icon: "📝", label: "見積作成" },
  { href: "/pc/invoices", icon: "💴", label: "請求一覧" },
  { href: "/sp/driving-report", icon: "🚐", label: "運転日報入力" },
];

/**
 * よく使うリンク フッター(参照画像 最下段右)。
 * 5 つの大きな pill ボタン横並び。
 */
export function QuickLinksFooter() {
  return (
    <nav aria-label="よく使うリンク">
      <ul className="flex items-center gap-2 flex-wrap">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-pill bg-navy text-white text-[12px] font-bold hover:bg-blue transition-colors min-h-[44px]"
            >
              <span aria-hidden>{l.icon}</span>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
