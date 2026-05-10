import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Tag } from "@/components/ui/Tag";

export const dynamic = "force-dynamic";

export default async function PointRulesPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/points");
  }

  const sb = await createClient();
  const { data: rules } = await sb
    .from("point_rules")
    .select(
      "id, category, display_name, description, amount_per_unit, unit, monthly_cap, is_active, display_order",
    )
    .order("display_order", { ascending: true });

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <Link
        href="/pc/points"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← ポイント管理へ戻る
      </Link>
      <div className="mb-5 flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-navy flex items-center gap-2">
            <span aria-hidden>⚙️</span>ポイント獲得ルール
          </h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            実業務 KPI と連動した獲得ルール。社員の頑張りを定量化します。
          </p>
        </div>
        <Tag variant="p1" size="sm">管理者専用</Tag>
      </div>

      <section className="bg-panel border border-line rounded-panel overflow-hidden">
        <header className="px-4 py-3 border-b border-line">
          <h2 className="text-[14px] font-bold text-ink">
            現在の獲得ルール ({rules?.length ?? 0} 件)
          </h2>
        </header>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>カテゴリ</th>
                <th>説明</th>
                <th className="text-right">付与pt</th>
                <th className="text-right">月上限</th>
                <th>状態</th>
              </tr>
            </thead>
            <tbody>
              {(rules ?? []).map((r) => (
                <tr key={r.id as string}>
                  <td>
                    <Tag
                      variant={
                        r.category === "出来高"
                          ? "p3"
                          : r.category === "安全"
                            ? "gold"
                            : r.category === "称号"
                              ? "p4"
                              : r.category === "リーダー"
                                ? "p1"
                                : "blue"
                      }
                    >
                      {r.category as string}
                    </Tag>
                  </td>
                  <td>
                    <div className="text-[13px] font-bold text-ink">
                      {r.display_name as string}
                    </div>
                    <div className="text-[11px] text-ink-3">
                      {r.description as string}
                    </div>
                  </td>
                  <td className="text-right font-mono font-bold text-p4">
                    {r.amount_per_unit as number}pt/{r.unit as string}
                  </td>
                  <td className="text-right text-[12px]">
                    {r.monthly_cap
                      ? `${(r.monthly_cap as number).toLocaleString("ja-JP")}pt`
                      : "上限なし"}
                  </td>
                  <td>
                    {r.is_active ? (
                      <Tag variant="p3">有効</Tag>
                    ) : (
                      <Tag variant="neutral">停止中</Tag>
                    )}
                  </td>
                </tr>
              ))}
              {(!rules || rules.length === 0) && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-[12px] text-ink-3"
                  >
                    ルールがまだ登録されていません(マイグレーション
                    0012 のシードを実行してください)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="wf-note mt-4">
        <span className="wf-note-icon">📌</span>
        <span>
          ルールの編集 UI は次バージョンで追加予定です。現状は SQL から直接
          point_rules テーブルを更新してください。
          <br />
          ベストプラクティス: ルール変更時は社員にメッセージで告知し、
          月初リセットのタイミングで反映するのが望ましい。
        </span>
      </div>
    </div>
  );
}
