import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * マスタ管理ハブ。既存の各マスタ画面へのリンク集として暫定実装。
 * 統合マスタ画面は将来。
 */
export default async function MastersHubPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }

  const masters: Array<{
    href: string;
    label: string;
    icon: string;
    desc: string;
  }> = [
    { href: "/pc/customers", label: "客先マスタ", icon: "🤝", desc: "取引先・元請先の管理" },
    { href: "/pc/projects", label: "現場マスタ", icon: "🏗️", desc: "案件・現場の登録" },
    { href: "/pc/users", label: "ユーザー管理", icon: "👥", desc: "社員アカウント・ロール" },
    { href: "/pc/price-items", label: "単価マスタ", icon: "💰", desc: "見積項目の単価設定" },
    { href: "/pc/qualifications", label: "資格マスタ", icon: "🎓", desc: "保有資格の定義" },
    { href: "/pc/work-classifications", label: "工種マスタ", icon: "🏷️", desc: "工事種別の分類" },
    { href: "/pc/org-departments", label: "部署マスタ", icon: "🏢", desc: "組織の部署設定" },
    { href: "/pc/org-positions", label: "役職マスタ", icon: "🎖️", desc: "役職の定義" },
  ];

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-navy">マスタ管理</h1>
        <p className="text-[13px] text-ink-2 mt-1">
          各マスタへのアクセスを 1 箇所にまとめています。
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {masters.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="bg-panel border border-line rounded-cardLg p-5 shadow-card hover:shadow-cardHover hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-card bg-blue-bg flex items-center justify-center text-[20px] shrink-0"
                aria-hidden
              >
                {m.icon}
              </div>
              <div>
                <div className="text-[14px] font-bold text-ink">{m.label}</div>
                <div className="text-[11px] text-ink-3 mt-0.5">{m.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
