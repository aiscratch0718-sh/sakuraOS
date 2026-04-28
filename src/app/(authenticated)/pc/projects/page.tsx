import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PcProjectsPage() {
  const session = await requireSession();
  const canEdit = ["office", "ceo", "system"].includes(session.role);
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, code, name, status, started_at, contract_amount_cents, customer_id, customers(name)",
    )
    .order("status", { ascending: true })
    .order("started_at", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">現場一覧</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            全現場(プロジェクト)の一覧。日報入力や原価集計の元データになります。
          </p>
        </div>
        {canEdit && (
          <Link
            href="/pc/projects/new"
            className="btn-primary py-2 px-4 text-[13px]"
          >
            + 新規登録
          </Link>
        )}
      </div>

      <section className="panel-pad">
        {!projects || projects.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            現場が登録されていません。
            {canEdit && (
              <>
                <br />
                <Link
                  href="/pc/projects/new"
                  className="text-blue underline mt-2 inline-block"
                >
                  新規登録する
                </Link>
              </>
            )}
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold">コード</th>
                  <th className="py-2 px-3 font-bold">現場名</th>
                  <th className="py-2 px-3 font-bold">客先</th>
                  <th className="py-2 px-3 font-bold">開始日</th>
                  <th className="py-2 px-3 font-bold text-right">契約金額</th>
                  <th className="py-2 px-3 font-bold">状態</th>
                  {canEdit && <th className="py-2 px-3 font-bold">操作</th>}
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const customerName =
                    (p.customers as { name?: string } | null)?.name ?? "—";
                  const amountYen =
                    typeof p.contract_amount_cents === "number"
                      ? Math.round(p.contract_amount_cents / 100)
                      : null;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-line hover:bg-blue-bg/30"
                    >
                      <td className="py-2 px-3 font-mono text-[11px] text-ink-2 whitespace-nowrap">
                        {p.code ?? "—"}
                      </td>
                      <td className="py-2 px-3 font-bold">{p.name}</td>
                      <td className="py-2 px-3">{customerName}</td>
                      <td className="py-2 px-3 text-ink-2 whitespace-nowrap">
                        {p.started_at ? formatJpDate(p.started_at) : "—"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[12px] whitespace-nowrap">
                        {amountYen !== null
                          ? `¥${amountYen.toLocaleString("ja-JP")}`
                          : "—"}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {p.status === "active" ? (
                          <span className="pill-teal">稼働中</span>
                        ) : p.status === "completed" ? (
                          <span className="pill-blue">完了</span>
                        ) : (
                          <span className="pill-amber">アーカイブ</span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="py-2 px-3 whitespace-nowrap">
                          <Link
                            href={`/pc/projects/${p.id}`}
                            className="text-[11px] text-blue underline"
                          >
                            編集
                          </Link>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
