import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; pill: string }> = {
  draft: { label: "下書き", pill: "pill-blue" },
  issued: { label: "発行済", pill: "pill-amber" },
  paid: { label: "支払済", pill: "pill-teal" },
  overdue: { label: "期限超過", pill: "pill-red" },
  voided: { label: "無効", pill: "pill-red" },
};

export default async function InvoicesListPage() {
  const session = await requireSession();
  const canEdit = ["office", "ceo", "system"].includes(session.role);
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select(
      "id, invoice_no, title, status, issue_date, due_date, total_cents, customer_id, customers(name)",
    )
    .order("issue_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  // 集計: 未収 / 入金済
  const totals = (invoices ?? []).reduce(
    (acc, i) => {
      const yen = Math.round(Number(i.total_cents) / 100);
      if (i.status === "paid") acc.paid += yen;
      else if (i.status === "issued" || i.status === "overdue")
        acc.outstanding += yen;
      return acc;
    },
    { outstanding: 0, paid: 0 },
  );

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">請求書一覧</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            発行した請求書。会計はマネーフォワードで処理してください(本システムは記録のみ)。
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <a
              href="/api/invoices/mf-csv"
              className="btn-teal py-2 px-3 text-[12px] font-bold whitespace-nowrap"
              title="マネーフォワード会計取込用 CSV"
            >
              📥 MF CSV
            </a>
          )}
          {canEdit && (
            <Link
              href="/pc/invoices/new"
              className="btn-primary py-2 px-4 text-[13px]"
            >
              + 新規請求書
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="kpi-card kpi-amber">
          <div className="text-[11px] text-ink-2 mb-1">未収金(発行済+期限超過)</div>
          <div className="text-[22px] font-extrabold leading-none whitespace-nowrap">
            ¥{totals.outstanding.toLocaleString("ja-JP")}
          </div>
        </div>
        <div className="kpi-card kpi-teal">
          <div className="text-[11px] text-ink-2 mb-1">入金済(累計)</div>
          <div className="text-[22px] font-extrabold leading-none whitespace-nowrap">
            ¥{totals.paid.toLocaleString("ja-JP")}
          </div>
        </div>
      </div>

      <section className="panel-pad">
        {!invoices || invoices.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            まだ請求書がありません。
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
                  <th className="py-2 px-3 font-bold">支払期限</th>
                  <th className="py-2 px-3 font-bold text-right">合計</th>
                  <th className="py-2 px-3 font-bold">状態</th>
                  {canEdit && <th className="py-2 px-3 font-bold">操作</th>}
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => {
                  const customerName =
                    (i.customers as { name?: string } | null)?.name ?? "—";
                  const yen = Math.round(Number(i.total_cents) / 100);
                  const meta = STATUS_LABEL[i.status] ?? {
                    label: i.status,
                    pill: "pill-blue",
                  };
                  return (
                    <tr
                      key={i.id}
                      className="border-b border-line hover:bg-blue-bg/30"
                    >
                      <td className="py-2 px-3 font-mono text-[11px] text-ink-2 whitespace-nowrap">
                        {i.invoice_no ?? "—"}
                      </td>
                      <td className="py-2 px-3 font-bold">{i.title}</td>
                      <td className="py-2 px-3">{customerName}</td>
                      <td className="py-2 px-3 text-ink-2 whitespace-nowrap">
                        {formatJpDate(i.issue_date)}
                      </td>
                      <td className="py-2 px-3 text-ink-2 whitespace-nowrap">
                        {i.due_date ? formatJpDate(i.due_date) : "—"}
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
                            href={`/pc/invoices/${i.id}`}
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
