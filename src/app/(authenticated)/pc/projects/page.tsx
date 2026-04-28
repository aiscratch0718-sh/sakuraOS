import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PcProjectsPage() {
  await requireSession();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, code, name, status, started_at, customer_id, customers(name)",
    )
    .order("started_at", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-navy">現場一覧</h1>
        <p className="text-[12px] text-ink-2 mt-0.5">
          全現場(プロジェクト)の一覧。新規登録・編集は Beta(第3段階)で実装します。
        </p>
      </div>

      <section className="panel-pad">
        {!projects || projects.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            現場が登録されていません。
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
                  <th className="py-2 px-3 font-bold">状態</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const customerName =
                    (p.customers as { name?: string } | null)?.name ?? "—";
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-line hover:bg-blue-bg/30"
                    >
                      <td className="py-2 px-3 font-mono text-[11px] text-ink-2 whitespace-nowrap">
                        {p.code}
                      </td>
                      <td className="py-2 px-3 font-bold">{p.name}</td>
                      <td className="py-2 px-3">{customerName}</td>
                      <td className="py-2 px-3 text-ink-2 whitespace-nowrap">
                        {p.started_at ? formatJpDate(p.started_at) : "—"}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {p.status === "active" ? (
                          <span className="pill-teal">稼働中</span>
                        ) : p.status === "closed" ? (
                          <span className="pill-blue">終了</span>
                        ) : (
                          <span className="pill-amber">{p.status}</span>
                        )}
                      </td>
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
