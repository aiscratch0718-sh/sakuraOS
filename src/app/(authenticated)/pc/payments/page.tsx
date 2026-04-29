import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * 入金管理画面。
 * - 期限超過(due_date < today、未入金)
 * - 7日以内に期限到来
 * - 期限なし発行済
 * の3バケットで請求書を表示。office/ceo は「入金確認」ボタンを直接押せる。
 */
export default async function PcPaymentsPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }

  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select(
      "id, invoice_no, title, status, issue_date, due_date, total_cents, customer_id, customers(name)",
    )
    .in("status", ["issued", "overdue"])
    .order("due_date", { ascending: true, nullsFirst: false });

  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const overdue: typeof invoices = [];
  const dueSoon: typeof invoices = [];
  const others: typeof invoices = [];

  for (const inv of invoices ?? []) {
    if (!inv.due_date) {
      others!.push(inv);
    } else if (inv.due_date < today) {
      overdue!.push(inv);
    } else if (inv.due_date <= sevenDaysLater) {
      dueSoon!.push(inv);
    } else {
      others!.push(inv);
    }
  }

  const sumYen = (list: typeof invoices) =>
    (list ?? []).reduce(
      (s, i) => s + Math.round(Number(i.total_cents) / 100),
      0,
    );

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-navy">入金管理</h1>
        <p className="text-[12px] text-ink-2 mt-0.5">
          発行済みで未入金の請求書を「期限超過 / 7日以内 / それ以外」に分類しています。
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="kpi-card kpi-red">
          <div className="text-[11px] text-ink-2 mb-1">⚠ 期限超過</div>
          <div className="text-[22px] font-extrabold leading-none whitespace-nowrap">
            ¥{sumYen(overdue).toLocaleString("ja-JP")}
          </div>
          <div className="text-[10px] text-ink-3 mt-1">{overdue?.length ?? 0} 件</div>
        </div>
        <div className="kpi-card kpi-amber">
          <div className="text-[11px] text-ink-2 mb-1">7日以内に期限</div>
          <div className="text-[22px] font-extrabold leading-none whitespace-nowrap">
            ¥{sumYen(dueSoon).toLocaleString("ja-JP")}
          </div>
          <div className="text-[10px] text-ink-3 mt-1">{dueSoon?.length ?? 0} 件</div>
        </div>
        <div className="kpi-card kpi-blue">
          <div className="text-[11px] text-ink-2 mb-1">それ以外(未入金)</div>
          <div className="text-[22px] font-extrabold leading-none whitespace-nowrap">
            ¥{sumYen(others).toLocaleString("ja-JP")}
          </div>
          <div className="text-[10px] text-ink-3 mt-1">{others?.length ?? 0} 件</div>
        </div>
      </div>

      <PaymentSection title="⚠ 期限超過(早急に対応)" pillCls="pill-red" rows={overdue ?? []} />
      <PaymentSection title="🔔 7日以内に期限到来" pillCls="pill-amber" rows={dueSoon ?? []} />
      <PaymentSection title="📌 それ以外の未入金" pillCls="pill-blue" rows={others ?? []} />
    </div>
  );
}

type PaymentRow = {
  id: string;
  invoice_no: string | null;
  title: string;
  issue_date: string;
  due_date: string | null;
  total_cents: number;
  customers: { name?: string } | { name?: string }[] | null;
};

function customerName(c: PaymentRow["customers"]): string {
  if (!c) return "—";
  if (Array.isArray(c)) return c[0]?.name ?? "—";
  return c.name ?? "—";
}

function PaymentSection({
  title,
  pillCls,
  rows,
}: {
  title: string;
  pillCls: string;
  rows: PaymentRow[];
}) {
  if (rows.length === 0) return null;
  return (
    <section className="panel-pad mb-4">
      <h2 className="panel-title">
        <span aria-hidden>📥</span>
        <span>{title}</span>
        <span className={`${pillCls} ml-auto`}>{rows.length}</span>
      </h2>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] text-navy bg-blue-bg">
              <th className="py-2 px-3 font-bold">No.</th>
              <th className="py-2 px-3 font-bold">客先</th>
              <th className="py-2 px-3 font-bold">件名</th>
              <th className="py-2 px-3 font-bold">発行日</th>
              <th className="py-2 px-3 font-bold">支払期限</th>
              <th className="py-2 px-3 font-bold text-right">金額</th>
              <th className="py-2 px-3 font-bold">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line hover:bg-blue-bg/30">
                <td className="py-2 px-3 font-mono text-[11px]">
                  {r.invoice_no ?? "—"}
                </td>
                <td className="py-2 px-3 font-bold">
                  {customerName(r.customers)}
                </td>
                <td className="py-2 px-3">{r.title}</td>
                <td className="py-2 px-3 text-ink-2 whitespace-nowrap">
                  {formatJpDate(r.issue_date)}
                </td>
                <td className="py-2 px-3 whitespace-nowrap">
                  {r.due_date ? formatJpDate(r.due_date) : "—"}
                </td>
                <td className="py-2 px-3 text-right font-mono">
                  ¥
                  {Math.round(Number(r.total_cents) / 100).toLocaleString(
                    "ja-JP",
                  )}
                </td>
                <td className="py-2 px-3 whitespace-nowrap">
                  <Link
                    href={`/pc/invoices/${r.id}`}
                    className="text-[11px] text-blue underline"
                  >
                    詳細・入金確認
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
