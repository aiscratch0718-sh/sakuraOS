import Link from "next/link";

const LINKS = [
  { href: "/sp/report3/new", label: "REPORT3入力" },
  { href: "/pc/projects", label: "案件一覧" },
  { href: "/pc/estimates/new", label: "見積作成" },
  { href: "/pc/invoices", label: "請求一覧" },
  { href: "/sp/vehicle-runs/new", label: "運転日報入力" },
];

export function QuickLinksFooter() {
  return (
    <nav aria-label="よく使うリンク" className="flex h-full items-center">
      <ul className="grid w-full grid-cols-5 gap-4">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex min-h-[42px] items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-3 text-[13px] font-bold text-blue-700 transition-colors hover:bg-blue-100"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
