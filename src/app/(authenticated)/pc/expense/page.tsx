import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * 案件別 経費管理表(秋元様要件 Q4 / Q5 反映)
 *
 * 自動集計項目:
 * - 見積金額(税抜): 受注済み見積の合計
 * - 仕入(材料): supplier_invoices.invoice_type = material の合計
 * - リース: supplier_invoices.invoice_type = lease の合計
 * - 協力会社: supplier_invoices.invoice_type = subcontractor の合計 + 人工/残業
 * - 諸経費: supplier_invoices.invoice_type = misc の合計
 * - 車両交通費: receipts.category = 交通費 の合計(承認済)
 * - 人件費: project_cost_aggregates.total_labor_cost_cents(REPORT3 由来)
 * - 宿泊費: receipts.category = 宿泊費 の合計(承認済)
 */
export default async function ExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }
  const params = await searchParams;
  const sb = await createClient();

  const { data: projects } = await sb
    .from("projects")
    .select("id, name, contract_amount_cents")
    .order("started_at", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  const projectId = params.project;
  let projectName: string | null = null;
  let contractYen = 0;
  let estimateYen = 0;
  let materialYen = 0;
  let leaseYen = 0;
  let subcontractorYen = 0;
  let subcontractorManhours = 0;
  let subcontractorOvertime = 0;
  let miscYen = 0;
  let transportYen = 0;
  let lodgingYen = 0;
  let laborYen = 0;
  let laborHours = 0;

  if (projectId) {
    const proj = (projects ?? []).find((p) => p.id === projectId);
    if (proj) {
      projectName = proj.name;
      contractYen =
        typeof proj.contract_amount_cents === "number"
          ? Math.round(proj.contract_amount_cents / 100)
          : 0;
    }

    const [{ data: estimates }, { data: si }, { data: rcps }, { data: cost }] =
      await Promise.all([
        sb
          .from("estimates")
          .select("subtotal_cents")
          .eq("project_id", projectId)
          .eq("status", "accepted"),
        sb
          .from("supplier_invoices")
          .select("invoice_type, amount_yen, manhours, overtime_hours")
          .eq("project_id", projectId),
        sb
          .from("receipts")
          .select("category, amount_yen, reviewed_at")
          .eq("project_id", projectId)
          .not("reviewed_at", "is", null),
        sb
          .from("project_cost_aggregates")
          .select("total_hours, total_labor_cost_cents")
          .eq("project_id", projectId)
          .maybeSingle(),
      ]);

    estimateYen = (estimates ?? []).reduce(
      (s, e) => s + Math.round(Number(e.subtotal_cents) / 100),
      0,
    );
    for (const r of si ?? []) {
      const yen = Number(r.amount_yen);
      if (r.invoice_type === "material") materialYen += yen;
      else if (r.invoice_type === "lease") leaseYen += yen;
      else if (r.invoice_type === "subcontractor") {
        subcontractorYen += yen;
        subcontractorManhours += Number(r.manhours ?? 0);
        subcontractorOvertime += Number(r.overtime_hours ?? 0);
      } else if (r.invoice_type === "misc") miscYen += yen;
    }
    for (const r of rcps ?? []) {
      const yen = Number(r.amount_yen);
      if (r.category === "交通費") transportYen += yen;
      else if (r.category === "宿泊費") lodgingYen += yen;
    }
    if (cost) {
      laborYen = Math.round(Number(cost.total_labor_cost_cents) / 100);
      laborHours = Number(cost.total_hours);
    }
  }

  const totalExpense =
    materialYen + leaseYen + subcontractorYen + miscYen + transportYen + lodgingYen + laborYen;
  const profit = estimateYen > 0 ? estimateYen - totalExpense : contractYen - totalExpense;
  const profitRate =
    (estimateYen > 0 ? estimateYen : contractYen) > 0
      ? (profit / (estimateYen > 0 ? estimateYen : contractYen)) * 100
      : null;

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-navy">経費管理表(案件別)</h1>
        <p className="text-[12px] text-ink-2 mt-0.5">
          見積・REPORT3・領収書・仕入先請求書から自動集計します。
        </p>
      </div>

      {/* 案件選択 */}
      <form method="get" className="panel-pad flex items-end gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-ink-2 mb-1">案件</label>
          <select name="project" defaultValue={projectId ?? ""} className="input">
            <option value="">— 選択してください —</option>
            {(projects ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary py-2 px-4 text-[12px]">表示</button>
      </form>

      {!projectId ? (
        <div className="panel-pad text-[12px] text-ink-3 text-center py-12">
          上のドロップダウンから案件を選択してください。
        </div>
      ) : (
        <>
          <h2 className="text-[15px] font-extrabold text-navy mb-3">
            {projectName ?? "—"}
          </h2>

          {/* サマリ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <Card label="契約金額" value={contractYen} cls="kpi-blue" />
            <Card label="見積合計(税抜・受注済)" value={estimateYen} cls="kpi-purple" />
            <Card label="経費合計" value={totalExpense} cls="kpi-amber" />
            <Card
              label={profit >= 0 ? "利益" : "損失"}
              value={profit}
              cls={profit >= 0 ? "kpi-teal" : "kpi-red"}
              sub={profitRate !== null ? `${profitRate.toFixed(1)} %` : ""}
            />
          </div>

          {/* 内訳 */}
          <section className="panel-pad mb-4">
            <h2 className="panel-title">
              <span aria-hidden>💴</span>
              <span>経費内訳(自動集計)</span>
            </h2>
            <table className="w-full text-[13px]">
              <tbody>
                <Row label="仕入(材料)" value={materialYen} note="仕入先請求書 → 材料" />
                <Row label="リース" value={leaseYen} note="仕入先請求書 → リース" />
                <Row
                  label="協力会社"
                  value={subcontractorYen}
                  note={`${subcontractorManhours.toFixed(1)} 人工 / 残業 ${subcontractorOvertime.toFixed(1)} h`}
                />
                <Row label="諸経費" value={miscYen} note="仕入先請求書 → その他" />
                <Row label="車両交通費" value={transportYen} note="領収書(交通費・確認済)" />
                <Row label="宿泊費" value={lodgingYen} note="領収書(宿泊費・確認済)" />
                <Row
                  label="人件費"
                  value={laborYen}
                  note={`REPORT3 自動集計 / ${laborHours.toFixed(1)} h`}
                  bold
                />
                <tr className="border-t-2 border-navy bg-amber-bg/30">
                  <td className="py-3 px-3 font-extrabold text-navy">経費合計</td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-navy text-[16px]">
                    ¥{totalExpense.toLocaleString("ja-JP")}
                  </td>
                  <td className="py-3 px-3"></td>
                </tr>
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

function Card({
  label,
  value,
  cls,
  sub,
}: {
  label: string;
  value: number;
  cls: string;
  sub?: string;
}) {
  return (
    <div className={`kpi-card ${cls}`}>
      <div className="text-[11px] text-ink-2 mb-1">{label}</div>
      <div className="text-[20px] font-extrabold leading-none whitespace-nowrap">
        {value >= 0 ? "" : "-"}¥{Math.abs(value).toLocaleString("ja-JP")}
      </div>
      {sub && <div className="text-[10px] text-ink-3 mt-1">{sub}</div>}
    </div>
  );
}

function Row({
  label,
  value,
  note,
  bold,
}: {
  label: string;
  value: number;
  note?: string;
  bold?: boolean;
}) {
  return (
    <tr className="border-b border-line">
      <td className={`py-2 px-3 ${bold ? "font-extrabold" : "font-bold"}`}>{label}</td>
      <td className="py-2 px-3 text-right font-mono">¥{value.toLocaleString("ja-JP")}</td>
      <td className="py-2 px-3 text-[10px] text-ink-3">{note ?? ""}</td>
    </tr>
  );
}
