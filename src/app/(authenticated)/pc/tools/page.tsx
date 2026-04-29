import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PcToolsPage() {
  const session = await requireSession();
  const canEdit = ["office", "ceo", "system"].includes(session.role);
  const supabase = await createClient();

  const { data: tools } = await supabase
    .from("tools")
    .select(
      "id, tool_code, name, category, status, current_lat, current_lng, current_user:profiles!tools_current_user_id_fkey(display_name), current_project:projects!tools_current_project_id_fkey(name)",
    )
    .eq("is_active", true)
    .order("status", { ascending: true })
    .order("tool_code", { ascending: true });

  const checkedOutCount = (tools ?? []).filter((t) => t.status === "checked_out").length;

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">工具管理</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            登録工具 {tools?.length ?? 0} 件 / 持出中 {checkedOutCount} 件。
            QR トークンによる持出/返却は SP の工具画面から行います。
          </p>
        </div>
        {canEdit && (
          <Link href="/pc/tools/new" className="btn-primary py-2 px-4 text-[13px]">
            + 工具を追加
          </Link>
        )}
      </div>

      <section className="panel-pad">
        {!tools || tools.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            まだ工具が登録されていません。
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold">コード</th>
                  <th className="py-2 px-3 font-bold">工具名</th>
                  <th className="py-2 px-3 font-bold">カテゴリ</th>
                  <th className="py-2 px-3 font-bold">状態</th>
                  <th className="py-2 px-3 font-bold">持出者</th>
                  <th className="py-2 px-3 font-bold">現場</th>
                  <th className="py-2 px-3 font-bold">GPS</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((t) => {
                  const userName =
                    (t.current_user as { display_name?: string } | null)
                      ?.display_name ?? "—";
                  const projectName =
                    (t.current_project as { name?: string } | null)?.name ?? "—";
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-line hover:bg-blue-bg/30"
                    >
                      <td className="py-2 px-3 font-mono text-[11px]">
                        {t.tool_code}
                      </td>
                      <td className="py-2 px-3 font-bold">{t.name}</td>
                      <td className="py-2 px-3 text-[11px] text-ink-2">
                        {t.category ?? "—"}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {t.status === "in_warehouse" ? (
                          <span className="pill-teal">倉庫</span>
                        ) : t.status === "checked_out" ? (
                          <span className="pill-amber">持出中</span>
                        ) : t.status === "maintenance" ? (
                          <span className="pill-blue">整備中</span>
                        ) : (
                          <span className="pill-red">廃棄</span>
                        )}
                      </td>
                      <td className="py-2 px-3">{userName}</td>
                      <td className="py-2 px-3">{projectName}</td>
                      <td className="py-2 px-3 text-[11px]">
                        {t.current_lat && t.current_lng ? (
                          <a
                            href={`https://maps.google.com/?q=${t.current_lat},${t.current_lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue underline"
                          >
                            📍 開く
                          </a>
                        ) : (
                          "—"
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
