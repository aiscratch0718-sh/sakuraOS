import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, { label: string; cls: string }> = {
  material: { label: "仕入(材料)", cls: "pill-blue" },
  lease: { label: "リース", cls: "pill-purple" },
  subcontractor: { label: "協力会社", cls: "pill-amber" },
  misc: { label: "その他", cls: "pill-blue" },
};

export default async function SupplierInvoicesPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }
  const sb = await createClient();
  const { data: rows } = await sb
    .from("supplier_invoices")
    .select(
      "id, invoice_type, supplier_name, invoice_date, invoice_number, amount_yen, manhours, overtime_hours, project:projects(name)",
    )
    .order("invoice_date", { ascending: false })
    .limit(200);

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">仕入先・協力会社 請求書</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            毎月仕入先・リース・協力会社から受領した請求書を入力します。経費管理表に自動集計されます。
          </p>
        </div>
        <Link href="/pc/supplier-invoices/new" className="btn-primary py-2 px-4 text-[13px]">
          + 請求書を入力
        </Link>
      </div>

      <section className="panel-pad">
        {!rows || rows.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">入力された請求書はありません。</p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] text-navy bg-blue-bg">
                <th className="py-2 px-3 font-bold">請求日</th>
                <th className="py-2 px-3 font-bold">種別</th>
                <th className="py-2 px-3 font-bold">仕入先</th>
                <th className="py-2 px-3 font-bold">現場</th>
                <th className="py-2 px-3 font-bold">No.</th>
                <th className="py-2 px-3 font-bold text-right">金額(税抜)</th>
                <th className="py-2 px-3 font-bold text-right">人工/残業</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const type = TYPE_LABEL[r.invoice_type] ?? { label: r.invoice_type, cls: "pill-blue" };
                const projName = (r.project as { name?: string } | null)?.name ?? "—";
                return (
                  <tr key={r.id} className="border-b border-line hover:bg-blue-bg/30">
                    <td className="py-2 px-3 whitespace-nowrap">{formatJpDate(r.invoice_date)}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={type.cls}>{type.label}</span>
                    </td>
                    <td className="py-2 px-3 font-bold">{r.supplier_name}</td>
                    <td className="py-2 px-3">{projName}</td>
                    <td className="py-2 px-3 font-mono text-[11px]">{r.invoice_number ?? "—"}</td>
                    <td className="py-2 px-3 text-right font-mono">
                      ¥{Number(r.amount_yen).toLocaleString("ja-JP")}
                    </td>
                    <td className="py-2 px-3 text-right text-[11px] font-mono">
                      {r.manhours != null
                        ? `${Number(r.manhours).toFixed(1)}人工`
                        : "—"}
                      {r.overtime_hours != null && (
                        <span className="text-ink-3 ml-1">
                          残{Number(r.overtime_hours).toFixed(1)}h
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
