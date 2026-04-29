import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PriceItemsPage() {
  const session = await requireSession();
  const canEdit = ["office", "ceo", "system"].includes(session.role);
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("price_items")
    .select("id, category, name, unit, standard_price_yen, min_price_yen, max_price_yen, is_active")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">単価マスタ</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            見積書の明細入力時に参照する標準単価。工種大分類との紐付けで利用想定。
          </p>
        </div>
        {canEdit && (
          <Link
            href="/pc/price-items/new"
            className="btn-primary py-2 px-4 text-[13px]"
          >
            + 単価を追加
          </Link>
        )}
      </div>

      <section className="panel-pad">
        {!items || items.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            まだ単価が登録されていません。
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold">カテゴリ</th>
                  <th className="py-2 px-3 font-bold">品名</th>
                  <th className="py-2 px-3 font-bold">単位</th>
                  <th className="py-2 px-3 font-bold text-right">標準単価</th>
                  <th className="py-2 px-3 font-bold text-right">下限</th>
                  <th className="py-2 px-3 font-bold text-right">上限</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-line hover:bg-blue-bg/30">
                    <td className="py-2 px-3 text-[11px] text-ink-2">
                      {it.category ?? "—"}
                    </td>
                    <td className="py-2 px-3 font-bold">{it.name}</td>
                    <td className="py-2 px-3 text-center">{it.unit}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      ¥{Number(it.standard_price_yen).toLocaleString("ja-JP")}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[11px] text-ink-3">
                      {it.min_price_yen != null
                        ? `¥${Number(it.min_price_yen).toLocaleString("ja-JP")}`
                        : "—"}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[11px] text-ink-3">
                      {it.max_price_yen != null
                        ? `¥${Number(it.max_price_yen).toLocaleString("ja-JP")}`
                        : "—"}
                    </td>
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
