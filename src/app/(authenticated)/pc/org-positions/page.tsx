import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrgPositionsPage() {
  const session = await requireSession();
  const canEdit = ["office", "ceo", "system"].includes(session.role);
  const sb = await createClient();
  const { data: positions } = await sb
    .from("org_positions")
    .select("id, name, rank, is_visible_to_all, sort_order")
    .eq("is_active", true)
    .order("rank", { ascending: false });

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">役職マスタ</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            社長 / 専務 / 部長 / 課長 / 主任 / 職長 / 一般 など。単価決定や人員配置に使用。
          </p>
        </div>
        {canEdit && (
          <Link href="/pc/org-positions/new" className="btn-primary py-2 px-4 text-[13px]">
            + 役職を追加
          </Link>
        )}
      </div>
      <section className="panel-pad">
        {!positions || positions.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">役職がまだ登録されていません。</p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] text-navy bg-blue-bg">
                <th className="py-2 px-3 font-bold">役職名</th>
                <th className="py-2 px-3 font-bold text-right">序列</th>
                <th className="py-2 px-3 font-bold">公開</th>
                <th className="py-2 px-3 font-bold text-right">表示順</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.id} className="border-b border-line hover:bg-blue-bg/30">
                  <td className="py-2 px-3 font-bold">{p.name}</td>
                  <td className="py-2 px-3 text-right font-mono">{p.rank}</td>
                  <td className="py-2 px-3">
                    {p.is_visible_to_all ? (
                      <span className="pill-teal">全員</span>
                    ) : (
                      <span className="pill-amber">制限</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">{p.sort_order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
