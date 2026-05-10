import Link from "next/link";
import { ClipboardList, Building2, FileText, Wallet, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const LINKS: { href: string; icon: LucideIcon; label: string }[] = [
  { href: "/sp/report3", icon: ClipboardList, label: "REPORT3 入力" },
  { href: "/pc/projects", icon: Building2, label: "案件一覧" },
  { href: "/pc/estimates/new", icon: FileText, label: "見積作成" },
  { href: "/pc/invoices", icon: Wallet, label: "請求一覧" },
  { href: "/sp/driving-report", icon: Truck, label: "運転日報入力" },
];

/**
 * よく使うリンク フッター(参照画像 最下段右)。
 * 5 つの淡ブルーボックス型ボタン横並び。
 */
export function QuickLinksFooter() {
  return (
    <nav aria-label="よく使うリンク">
      <ul className="flex items-center gap-2 flex-wrap">
        {LINKS.map((l) => {
          const Icon = l.icon;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg px-4 py-3 text-[12px] font-medium min-h-[44px] transition-colors"
              >
                <Icon className="w-4 h-4 text-blue-600" aria-hidden />
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
