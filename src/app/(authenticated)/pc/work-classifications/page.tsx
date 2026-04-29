import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * 工種マスタ(3階層)の閲覧ページ。
 * REPORT3 と単価マスタの基盤になる大分類/中分類/小分類を一覧表示する。
 * 編集・追加は本フェーズでは SQL 直接(将来のフェーズで CRUD UI を追加)。
 */
export default async function WorkClassificationsPage() {
  await requireSession();
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("work_classifications")
    .select("l1, l2, l3, display_order, is_active")
    .eq("is_active", true)
    .order("l1")
    .order("l2")
    .order("display_order");

  // l1 / l2 でグループ化
  type Group = { l1: string; l2Map: Map<string, string[]> };
  const grouped = new Map<string, Group>();
  for (const r of rows ?? []) {
    let g = grouped.get(r.l1);
    if (!g) {
      g = { l1: r.l1, l2Map: new Map() };
      grouped.set(r.l1, g);
    }
    const l3List = g.l2Map.get(r.l2) ?? [];
    l3List.push(r.l3);
    g.l2Map.set(r.l2, l3List);
  }

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-navy">工種マスタ(3階層)</h1>
        <p className="text-[12px] text-ink-2 mt-0.5">
          REPORT3 入力で使う大分類 → 中分類 → 小分類のツリー。新規追加は SQL での更新を予定(次フェーズで CRUD UI 追加)。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from(grouped.values()).map((g) => (
          <section key={g.l1} className="panel-pad">
            <h2 className="text-[14px] font-extrabold text-navy mb-2">
              {g.l1}
            </h2>
            <ul className="space-y-2">
              {Array.from(g.l2Map.entries()).map(([l2, l3List]) => (
                <li key={l2}>
                  <div className="text-[12px] font-bold text-blue mb-1">
                    {l2}
                  </div>
                  <ul className="ml-3 text-[12px] text-ink-2 space-y-0.5">
                    {l3List.map((l3) => (
                      <li key={l3}>・{l3}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
