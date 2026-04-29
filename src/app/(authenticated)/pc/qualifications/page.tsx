import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function QualificationsPage() {
  const session = await requireSession();
  const canEdit = ["office", "ceo", "system"].includes(session.role);
  const supabase = await createClient();

  const [{ data: quals }, { data: counts }] = await Promise.all([
    supabase
      .from("qualifications")
      .select("id, name, category, description, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("user_qualifications").select("qualification_id"),
  ]);

  const countMap = new Map<string, number>();
  for (const c of counts ?? []) {
    countMap.set(c.qualification_id, (countMap.get(c.qualification_id) ?? 0) + 1);
  }

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">資格マスタ</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            社員の保有資格は <Link href="/pc/users" className="text-blue underline">ユーザー一覧</Link> から登録できます。
          </p>
        </div>
        {canEdit && (
          <Link
            href="/pc/qualifications/new"
            className="btn-primary py-2 px-4 text-[13px]"
          >
            + 資格を追加
          </Link>
        )}
      </div>

      <section className="panel-pad">
        {!quals || quals.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            資格はまだ登録されていません。
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {quals.map((q) => (
              <li key={q.id} className="py-2 flex items-center gap-3">
                <div className="text-[10px] text-ink-3 font-bold tracking-wider w-16 shrink-0">
                  {q.category ?? "—"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold">{q.name}</div>
                  {q.description && (
                    <div className="text-[11px] text-ink-2">{q.description}</div>
                  )}
                </div>
                <div className="text-[11px] text-ink-3 whitespace-nowrap">
                  保有 {countMap.get(q.id) ?? 0} 名
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
