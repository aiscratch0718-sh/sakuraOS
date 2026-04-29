import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; pill: string }> = {
  draft: { label: "下書き", pill: "pill-blue" },
  sent: { label: "送付済", pill: "pill-amber" },
  accepted: { label: "受注", pill: "pill-teal" },
  rejected: { label: "失注", pill: "pill-red" },
  expired: { label: "期限切れ", pill: "pill-red" },
};

export default async function EstimatesListPage() {
  const session = await requireSession();
  const canEdit = ["office", "ceo", "system"].includes(session.role);
  const supabase = await createClient();

  const { data: estimates } = await supabase
    .from("estimates")
    .select(
      "id, estimate_no, title, status, issue_date, total_cents, customer_id, customers(name)",
    )
    .order("issue_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">見積一覧</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            作成した見積書。受注したら「請求書化」ボタンで請求書に変換できます。
          </p>
        </div>
        {canEdit && (
          <Link
            href="/pc/estimates/new"
            className="btn-primary py-2 px-4 text-[13px]"
          >
            + 新規見積
          </Link>
        )}
      </div>

      <section className="panel-pad">
        {!estimates || estimates.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            まだ見積がありません。
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold">No.</th>
                  <th className="py-2 px-3 font-bold">件名</th>
                  <th className="py-2 px-3 font-bold">客先</th>
                  <th className="py-2 px-3 font-bold">発行日</th>
                  <th className="py-2 px-3 font-bold text-right">合計</th>
                  <th className="py-2 px-3 font-bold">状態</th>
                  {canEdit && <th className="py-2 px-3 font-bold">操作</th>}
                </tr>
              </thead>
              <tbody>
                {estimates.map((e) => {
                  const customerName =
                    (e.customers as { name?: string } | null)?.name ?? "—";
                  const yen = Math.round(Number(e.total_cents) / 100);
                  const meta = STATUS_LABEL[e.status] ?? {
                    label: e.status,
                    pill: "pill-blue",
                  };
                  return (
                    <tr
                      key={e.id}
                      className="border-b border-line hover:bg-blue-bg/30"
                    >
                      <td className="py-2 px-3 font-mono text-[11px] text-ink-2 whitespace-nowrap">
                        {e.estimate_no ?? "—"}
                      </td>
                      <td className="py-2 px-3 font-bold">{e.title}</td>
                      <td className="py-2 px-3">{customerName}</td>
                      <td className="py-2 px-3 text-ink-2 whitespace-nowrap">
                        {formatJpDate(e.issue_date)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono whitespace-nowrap">
                        ¥{yen.toLocaleString("ja-JP")}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={meta.pill}>{meta.label}</span>
                      </td>
                      {canEdit && (
                        <td className="py-2 px-3 whitespace-nowrap">
                          <Link
                            href={`/pc/estimates/${e.id}`}
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
