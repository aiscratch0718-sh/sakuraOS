import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";
import { ReceiptActions } from "./ReceiptActions";

export const dynamic = "force-dynamic";

export default async function PcReceiptsPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }
  const sb = await createClient();
  const { data: receipts } = await sb
    .from("receipts")
    .select(
      "id, receipt_date, amount_yen, category, subcategory, payment_method, needs_reimbursement, reimbursement_status, reimbursement_paid_at, photo_url, reviewed_at, submitted_at, project:projects(name), user:profiles!receipts_user_id_fkey(display_name)",
    )
    .order("submitted_at", { ascending: false })
    .limit(200);

  const pending = (receipts ?? []).filter((r) => !r.reviewed_at).length;
  const reimbursementPending = (receipts ?? []).filter(
    (r) => r.needs_reimbursement && r.reimbursement_status === "requested",
  ).length;

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-navy">領収書管理</h1>
        <p className="text-[12px] text-ink-2 mt-0.5">
          総務課で目視確認 → カテゴリ振分 → 経費管理表に自動集計。立替分は精算実行で経理課へ通知。
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="kpi-card kpi-amber">
          <div className="text-[11px] text-ink-2 mb-1">未確認</div>
          <div className="text-[22px] font-extrabold leading-none">{pending}</div>
          <div className="text-[10px] text-ink-3 mt-1">件</div>
        </div>
        <div className="kpi-card kpi-purple">
          <div className="text-[11px] text-ink-2 mb-1">精算未実行</div>
          <div className="text-[22px] font-extrabold leading-none">{reimbursementPending}</div>
          <div className="text-[10px] text-ink-3 mt-1">件</div>
        </div>
        <div className="kpi-card kpi-teal">
          <div className="text-[11px] text-ink-2 mb-1">直近 200 件 合計</div>
          <div className="text-[22px] font-extrabold leading-none whitespace-nowrap">
            ¥
            {(receipts ?? [])
              .reduce((s, r) => s + Number(r.amount_yen), 0)
              .toLocaleString("ja-JP")}
          </div>
        </div>
      </div>

      <section className="panel-pad">
        {!receipts || receipts.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">領収書はまだ提出されていません。</p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold">領収日</th>
                  <th className="py-2 px-3 font-bold">提出者</th>
                  <th className="py-2 px-3 font-bold">現場</th>
                  <th className="py-2 px-3 font-bold">カテゴリ</th>
                  <th className="py-2 px-3 font-bold text-right">金額</th>
                  <th className="py-2 px-3 font-bold">支払</th>
                  <th className="py-2 px-3 font-bold">状態</th>
                  <th className="py-2 px-3 font-bold">写真</th>
                  <th className="py-2 px-3 font-bold">操作</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => {
                  const userName =
                    (r.user as { display_name?: string } | null)?.display_name ?? "—";
                  const projName = (r.project as { name?: string } | null)?.name ?? "—";
                  return (
                    <tr key={r.id} className="border-b border-line hover:bg-blue-bg/30">
                      <td className="py-2 px-3 whitespace-nowrap">{formatJpDate(r.receipt_date)}</td>
                      <td className="py-2 px-3 font-bold">{userName}</td>
                      <td className="py-2 px-3 text-[11px]">{projName}</td>
                      <td className="py-2 px-3 text-[11px]">
                        <span className="font-bold">{r.category}</span>
                        {r.subcategory && (
                          <span className="text-ink-3 ml-1">/ {r.subcategory}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        ¥{Number(r.amount_yen).toLocaleString("ja-JP")}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {r.payment_method === "company_card" ? (
                          <span className="pill-teal">会社カード</span>
                        ) : (
                          <span className="pill-amber">立替</span>
                        )}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {!r.reviewed_at ? (
                          <span className="pill-amber">未確認</span>
                        ) : r.needs_reimbursement && r.reimbursement_status !== "paid" ? (
                          <span className="pill-purple">精算待ち</span>
                        ) : r.reimbursement_status === "paid" ? (
                          <span className="pill-teal">支払済</span>
                        ) : (
                          <span className="pill-blue">確認済</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {r.photo_url ? (
                          <a
                            href={r.photo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue underline"
                          >
                            開く
                          </a>
                        ) : (
                          <span className="text-[10px] text-ink-3">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <ReceiptActions
                          receiptId={r.id}
                          isReviewed={!!r.reviewed_at}
                          needsReimbursement={!!r.needs_reimbursement}
                          reimbursementStatus={r.reimbursement_status}
                        />
                      </td>
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
