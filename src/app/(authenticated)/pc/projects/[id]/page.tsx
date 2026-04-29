import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { updateProject } from "@/features/master/actions/project";
import { ProjectForm } from "../ProjectForm";
import { formatJpDate } from "@/lib/format";
import type { ProjectActionResult } from "@/features/master/schemas";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/projects");
  }

  const supabase = await createClient();
  const [
    { data: project },
    { data: customers },
    { data: estimates },
    { data: invoices },
    { data: costAggregate },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, code, name, customer_id, status, started_at, ended_at, contract_amount_cents, note",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("customers")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase
      .from("estimates")
      .select("id, estimate_no, title, status, issue_date, total_cents")
      .eq("project_id", id)
      .order("issue_date", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, invoice_no, title, status, issue_date, total_cents")
      .eq("project_id", id)
      .order("issue_date", { ascending: false }),
    supabase
      .from("project_cost_aggregates")
      .select("total_hours, total_labor_cost_cents")
      .eq("project_id", id)
      .maybeSingle(),
  ]);

  if (!project) {
    notFound();
  }

  // 工事概況サマリ計算
  const estimateTotalYen = (estimates ?? []).reduce(
    (s, e) => s + Math.round(Number(e.total_cents) / 100),
    0,
  );
  const invoicedYen = (invoices ?? [])
    .filter((i) => i.status !== "voided" && i.status !== "draft")
    .reduce((s, i) => s + Math.round(Number(i.total_cents) / 100), 0);
  const paidYen = (invoices ?? [])
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Math.round(Number(i.total_cents) / 100), 0);
  const outstandingYen = invoicedYen - paidYen;
  const contractYen =
    typeof project.contract_amount_cents === "number"
      ? Math.round(project.contract_amount_cents / 100)
      : null;
  const laborCostYen = costAggregate
    ? Math.round(Number(costAggregate.total_labor_cost_cents) / 100)
    : 0;
  const grossProfit =
    contractYen !== null ? contractYen - laborCostYen : null;
  const grossProfitRate =
    contractYen && contractYen > 0 && grossProfit !== null
      ? (grossProfit / contractYen) * 100
      : null;

  const action = async (
    prev: ProjectActionResult,
    formData: FormData,
  ): Promise<ProjectActionResult> => {
    "use server";
    return updateProject(id, prev, formData);
  };

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      <Link
        href="/pc/projects"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← 現場一覧へ戻る
      </Link>

      <h1 className="text-xl font-extrabold text-navy mb-1">
        {project.name}
      </h1>
      <p className="text-[12px] text-ink-2 mb-5">
        現場マスタの編集および関連する見積書・請求書・原価情報を表示しています。
      </p>

      {/* === 工事概況サマリ === */}
      <section className="panel-pad mb-4">
        <h2 className="panel-title">
          <span aria-hidden>📊</span>
          <span>工事概況(自動集計)</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard
            label="契約金額"
            value={
              contractYen !== null ? `¥${contractYen.toLocaleString("ja-JP")}` : "—"
            }
            color="blue"
          />
          <SummaryCard
            label="見積合計"
            value={`¥${estimateTotalYen.toLocaleString("ja-JP")}`}
            color="purple"
            sub={`${estimates?.length ?? 0} 件`}
          />
          <SummaryCard
            label="請求済み"
            value={`¥${invoicedYen.toLocaleString("ja-JP")}`}
            color="amber"
            sub={`未収 ¥${outstandingYen.toLocaleString("ja-JP")}`}
          />
          <SummaryCard
            label="累計人件費"
            value={`¥${laborCostYen.toLocaleString("ja-JP")}`}
            color="teal"
            sub={
              costAggregate
                ? `${Number(costAggregate.total_hours).toFixed(1)} h`
                : "—"
            }
          />
        </div>
        {grossProfit !== null && (
          <div className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
            <div className="panel-pad bg-graybg">
              <div className="text-[10px] text-ink-3 font-bold mb-0.5">
                粗利(契約金額 - 累計人件費)
              </div>
              <div
                className={`text-[16px] font-extrabold ${grossProfit >= 0 ? "text-teal" : "text-red"}`}
              >
                {grossProfit >= 0 ? "+" : ""}
                ¥{grossProfit.toLocaleString("ja-JP")}
              </div>
            </div>
            {grossProfitRate !== null && (
              <div className="panel-pad bg-graybg">
                <div className="text-[10px] text-ink-3 font-bold mb-0.5">
                  粗利率
                </div>
                <div
                  className={`text-[16px] font-extrabold ${grossProfitRate >= 0 ? "text-teal" : "text-red"}`}
                >
                  {grossProfitRate.toFixed(1)} %
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* === 関連見積 === */}
      <section className="panel-pad mb-4">
        <h2 className="panel-title">
          <span aria-hidden>📝</span>
          <span>関連見積書</span>
        </h2>
        {!estimates || estimates.length === 0 ? (
          <p className="text-[11px] text-ink-3 py-2">
            関連する見積書はありません。
          </p>
        ) : (
          <ul className="space-y-1 text-[12px]">
            {estimates.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between border-b border-line py-1.5"
              >
                <Link
                  href={`/pc/estimates/${e.id}`}
                  className="hover:underline flex-1 truncate"
                >
                  <span className="font-mono text-[10px] text-ink-3 mr-2">
                    {e.estimate_no ?? "—"}
                  </span>
                  <span className="font-bold">{e.title}</span>
                </Link>
                <span className="text-ink-2 text-[10px] whitespace-nowrap mr-2">
                  {formatJpDate(e.issue_date)}
                </span>
                <span className="font-mono text-[12px] font-bold text-navy whitespace-nowrap">
                  ¥{Math.round(Number(e.total_cents) / 100).toLocaleString("ja-JP")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* === 関連請求 === */}
      <section className="panel-pad mb-5">
        <h2 className="panel-title">
          <span aria-hidden>🧾</span>
          <span>関連請求書</span>
        </h2>
        {!invoices || invoices.length === 0 ? (
          <p className="text-[11px] text-ink-3 py-2">
            関連する請求書はありません。
          </p>
        ) : (
          <ul className="space-y-1 text-[12px]">
            {invoices.map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between border-b border-line py-1.5"
              >
                <Link
                  href={`/pc/invoices/${i.id}`}
                  className="hover:underline flex-1 truncate"
                >
                  <span className="font-mono text-[10px] text-ink-3 mr-2">
                    {i.invoice_no ?? "—"}
                  </span>
                  <span className="font-bold">{i.title}</span>
                </Link>
                <StatusBadge status={i.status} />
                <span className="text-ink-2 text-[10px] whitespace-nowrap mx-2">
                  {formatJpDate(i.issue_date)}
                </span>
                <span className="font-mono text-[12px] font-bold text-navy whitespace-nowrap">
                  ¥{Math.round(Number(i.total_cents) / 100).toLocaleString("ja-JP")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* === 編集フォーム === */}
      <section className="panel-pad">
        <h2 className="panel-title">
          <span aria-hidden>⚙️</span>
          <span>現場マスタの編集</span>
        </h2>
        <ProjectForm
          initial={project}
          customers={customers ?? []}
          action={action}
          submitLabel="更新する"
        />
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color: "blue" | "purple" | "amber" | "teal";
  sub?: string;
}) {
  return (
    <div className={`kpi-card kpi-${color}`}>
      <div className="text-[11px] text-ink-2 mb-1">{label}</div>
      <div className="text-[18px] font-extrabold leading-none whitespace-nowrap">
        {value}
      </div>
      {sub && <div className="text-[10px] text-ink-3 mt-1">{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "pill-blue",
    issued: "pill-amber",
    paid: "pill-teal",
    overdue: "pill-red",
    voided: "pill-red",
  };
  const label: Record<string, string> = {
    draft: "下書き",
    issued: "発行済",
    paid: "支払済",
    overdue: "期限超過",
    voided: "無効",
  };
  return <span className={map[status] ?? "pill-blue"}>{label[status] ?? status}</span>;
}
