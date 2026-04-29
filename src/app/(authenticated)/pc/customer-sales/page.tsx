import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = { from?: string; to?: string };

export default async function CustomerSalesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }

  const params = await searchParams;
  const supabase = await createClient();

  // 期間デフォルト: 当年度開始(4月)〜本日
  const today = new Date();
  const fyStart = new Date(today.getFullYear(), today.getMonth() >= 3 ? 3 : today.getMonth() < 3 ? -9 : 3, 1);
  const defaultFrom = params.from ?? fyStart.toISOString().slice(0, 10);
  const defaultTo =
    params.to ?? today.toISOString().slice(0, 10);

  // 期間内の請求書(draft / voided 除外)を顧客単位で集計
  const { data: invoices } = await supabase
    .from("invoices")
    .select(
      "id, status, issue_date, total_cents, customer_id, customers(name)",
    )
    .gte("issue_date", defaultFrom)
    .lte("issue_date", defaultTo)
    .not("status", "in", "(draft,voided)");

  type Agg = {
    customerId: string;
    customerName: string;
    invoiced: number;
    paid: number;
    outstanding: number;
    count: number;
  };

  const agg = new Map<string, Agg>();
  for (const inv of invoices ?? []) {
    const yen = Math.round(Number(inv.total_cents) / 100);
    const cId = inv.customer_id as string;
    const cName = (inv.customers as { name?: string } | null)?.name ?? "—";
    const cur = agg.get(cId) ?? {
      customerId: cId,
      customerName: cName,
      invoiced: 0,
      paid: 0,
      outstanding: 0,
      count: 0,
    };
    cur.invoiced += yen;
    if (inv.status === "paid") cur.paid += yen;
    else cur.outstanding += yen;
    cur.count += 1;
    agg.set(cId, cur);
  }

  const rows = Array.from(agg.values()).sort((a, b) => b.invoiced - a.invoiced);
  const totalInvoiced = rows.reduce((s, r) => s + r.invoiced, 0);
  const totalPaid = rows.reduce((s, r) => s + r.paid, 0);
  const totalOutstanding = rows.reduce((s, r) => s + r.outstanding, 0);

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-navy">客先別売上レポート</h1>
        <p className="text-[12px] text-ink-2 mt-0.5">
          発行済み請求書(下書き・無効を除く)を顧客単位で集計しています。
        </p>
      </div>

      {/* 期間フィルタ */}
      <form method="get" className="panel-pad flex items-end gap-3 mb-4">
        <div>
          <label className="block text-[11px] font-bold text-ink-2 mb-1">
            開始日
          </label>
          <input
            type="date"
            name="from"
            defaultValue={defaultFrom}
            className="input"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-ink-2 mb-1">
            終了日
          </label>
          <input
            type="date"
            name="to"
            defaultValue={defaultTo}
            className="input"
          />
        </div>
        <button type="submit" className="btn-primary py-2 px-4 text-[12px]">
          絞り込む
        </button>
      </form>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="kpi-card kpi-blue">
          <div className="text-[11px] text-ink-2 mb-1">期間 売上(請求済)</div>
          <div className="text-[22px] font-extrabold leading-none whitespace-nowrap">
            ¥{totalInvoiced.toLocaleString("ja-JP")}
          </div>
          <div className="text-[10px] text-ink-3 mt-1">
            {rows.length} 客先 / {rows.reduce((s, r) => s + r.count, 0)} 件
          </div>
        </div>
        <div className="kpi-card kpi-teal">
          <div className="text-[11px] text-ink-2 mb-1">入金済</div>
          <div className="text-[22px] font-extrabold leading-none whitespace-nowrap">
            ¥{totalPaid.toLocaleString("ja-JP")}
          </div>
        </div>
        <div className="kpi-card kpi-amber">
          <div className="text-[11px] text-ink-2 mb-1">未収金</div>
          <div className="text-[22px] font-extrabold leading-none whitespace-nowrap">
            ¥{totalOutstanding.toLocaleString("ja-JP")}
          </div>
        </div>
      </div>

      <section className="panel-pad">
        {rows.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            条件に合う請求書はありません。
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold">順位</th>
                  <th className="py-2 px-3 font-bold">客先</th>
                  <th className="py-2 px-3 font-bold text-right">件数</th>
                  <th className="py-2 px-3 font-bold text-right">売上</th>
                  <th className="py-2 px-3 font-bold text-right">入金済</th>
                  <th className="py-2 px-3 font-bold text-right">未収</th>
                  <th className="py-2 px-3 font-bold text-right">構成比</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.customerId} className="border-b border-line hover:bg-blue-bg/30">
                    <td className="py-2 px-3 font-mono">{i + 1}</td>
                    <td className="py-2 px-3 font-bold">
                      <Link
                        href={`/pc/customers/${r.customerId}`}
                        className="hover:underline"
                      >
                        {r.customerName}
                      </Link>
                    </td>
                    <td className="py-2 px-3 text-right">{r.count}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      ¥{r.invoiced.toLocaleString("ja-JP")}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-teal">
                      ¥{r.paid.toLocaleString("ja-JP")}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-amber">
                      ¥{r.outstanding.toLocaleString("ja-JP")}
                    </td>
                    <td className="py-2 px-3 text-right text-[11px]">
                      {totalInvoiced > 0
                        ? `${((r.invoiced / totalInvoiced) * 100).toFixed(1)}%`
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
