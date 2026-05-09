import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ContractorTemplatesPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }
  const sb = await createClient();
  const { data: templates } = await sb
    .from("contractor_templates")
    .select(
      "id, template_name, template_type, template_url, used_count, last_used_at, created_at, customer:customers(name)",
    )
    .eq("is_active", true)
    .order("last_used_at", { ascending: false, nullsFirst: false });

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">元請テンプレート</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            元請さまごとに過去の書類フォーマットを保管。次回の安全書類作成時に「前回のテンプレートを使用しますか?」として提案されます。
          </p>
        </div>
        <Link href="/pc/contractor-templates/new" className="btn-primary py-2 px-4 text-[13px]">
          + テンプレートを追加
        </Link>
      </div>

      <section className="panel-pad">
        {!templates || templates.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            テンプレートはまだ登録されていません。
          </p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] text-navy bg-blue-bg">
                <th className="py-2 px-3 font-bold">元請</th>
                <th className="py-2 px-3 font-bold">テンプレート名</th>
                <th className="py-2 px-3 font-bold">種別</th>
                <th className="py-2 px-3 font-bold text-right">使用回数</th>
                <th className="py-2 px-3 font-bold">最終使用</th>
                <th className="py-2 px-3 font-bold">ファイル</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => {
                const customerName = (t.customer as { name?: string } | null)?.name ?? "—";
                return (
                  <tr key={t.id} className="border-b border-line hover:bg-blue-bg/30">
                    <td className="py-2 px-3 font-bold">{customerName}</td>
                    <td className="py-2 px-3">{t.template_name}</td>
                    <td className="py-2 px-3 text-[11px] text-ink-2">
                      {t.template_type ?? "—"}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">{t.used_count}</td>
                    <td className="py-2 px-3 text-[11px] text-ink-2">
                      {t.last_used_at ? formatJpDate(t.last_used_at) : "—"}
                    </td>
                    <td className="py-2 px-3">
                      <a
                        href={t.template_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue underline"
                      >
                        開く →
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
