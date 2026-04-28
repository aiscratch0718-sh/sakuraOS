import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PcCustomersPage() {
  const session = await requireSession();
  const supabase = await createClient();
  const canEdit = ["office", "ceo", "system"].includes(session.role);

  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, contact_person, phone, email, is_active, created_at")
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">客先一覧</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            請求先・現場登録の元になる客先マスタ
          </p>
        </div>
        {canEdit && (
          <Link
            href="/pc/customers/new"
            className="btn-primary py-2 px-4 text-[13px]"
          >
            + 新規登録
          </Link>
        )}
      </div>

      <section className="panel-pad">
        {!customers || customers.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            まだ客先が登録されていません。
            {canEdit && (
              <>
                <br />
                <Link
                  href="/pc/customers/new"
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
                  <th className="py-2 px-3 font-bold">客先名</th>
                  <th className="py-2 px-3 font-bold">担当者</th>
                  <th className="py-2 px-3 font-bold">電話</th>
                  <th className="py-2 px-3 font-bold">メール</th>
                  <th className="py-2 px-3 font-bold">状態</th>
                  {canEdit && <th className="py-2 px-3 font-bold">操作</th>}
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-line hover:bg-blue-bg/30"
                  >
                    <td className="py-2 px-3 font-bold">{c.name}</td>
                    <td className="py-2 px-3">{c.contact_person ?? "—"}</td>
                    <td className="py-2 px-3 text-ink-2">{c.phone ?? "—"}</td>
                    <td className="py-2 px-3 text-ink-2 text-[11px]">
                      {c.email ?? "—"}
                    </td>
                    <td className="py-2 px-3">
                      {c.is_active ? (
                        <span className="pill-teal">アクティブ</span>
                      ) : (
                        <span className="pill-blue">非表示</span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="py-2 px-3 whitespace-nowrap">
                        <Link
                          href={`/pc/customers/${c.id}`}
                          className="text-[11px] text-blue underline"
                        >
                          編集
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
