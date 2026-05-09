import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrgDepartmentsPage() {
  const session = await requireSession();
  const canEdit = ["office", "ceo", "system"].includes(session.role);
  const sb = await createClient();
  const { data: depts } = await sb
    .from("org_departments")
    .select("id, name, parent_id, is_visible_to_all, sort_order, parent:org_departments!parent_id(name)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">部署マスタ</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            組織図の部署を管理します。総務課・経理課・施工管理課など。
          </p>
        </div>
        {canEdit && (
          <Link href="/pc/org-departments/new" className="btn-primary py-2 px-4 text-[13px]">
            + 部署を追加
          </Link>
        )}
      </div>

      <section className="panel-pad">
        {!depts || depts.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">部署がまだ登録されていません。</p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] text-navy bg-blue-bg">
                <th className="py-2 px-3 font-bold">部署名</th>
                <th className="py-2 px-3 font-bold">親部署</th>
                <th className="py-2 px-3 font-bold">公開</th>
                <th className="py-2 px-3 font-bold text-right">表示順</th>
              </tr>
            </thead>
            <tbody>
              {depts.map((d) => {
                const parentName =
                  (d.parent as { name?: string } | null)?.name ?? "—";
                return (
                  <tr key={d.id} className="border-b border-line hover:bg-blue-bg/30">
                    <td className="py-2 px-3 font-bold">{d.name}</td>
                    <td className="py-2 px-3">{parentName}</td>
                    <td className="py-2 px-3">
                      {d.is_visible_to_all ? (
                        <span className="pill-teal">全員</span>
                      ) : (
                        <span className="pill-amber">制限</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">{d.sort_order}</td>
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
