import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SpReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ warning?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const sb = await createClient();
  const { data: receipts } = await sb
    .from("receipts")
    .select("id, receipt_date, amount_yen, category, payment_method, reimbursement_status, photo_url, reviewed_at")
    .eq("user_id", session.userId)
    .order("submitted_at", { ascending: false })
    .limit(20);

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <h1 className="text-lg font-extrabold text-navy mb-1">領収書</h1>
      <p className="text-[11px] text-ink-3 mb-3">
        立替の場合は精算申請も行えます。提出後、総務課が確認します。
      </p>

      {params.warning && (
        <div className="panel-pad mb-3 bg-amber-bg/40 border-amber/30">
          <div className="text-[12px] font-bold text-amber">⚠ {params.warning}</div>
        </div>
      )}

      <Link
        href="/sp/receipts/new"
        className="block w-full bg-pink hover:bg-pink-2 transition-colors text-white text-center py-3 rounded-panel text-[14px] font-bold shadow-card mb-4"
      >
        🧾 新規領収書を提出
      </Link>

      <h2 className="text-[12px] font-bold text-ink-2 tracking-wider mb-2 px-1">直近の提出履歴</h2>
      {!receipts || receipts.length === 0 ? (
        <div className="panel-pad text-[12px] text-ink-3 text-center py-6">まだ提出はありません。</div>
      ) : (
        <ul className="space-y-2">
          {receipts.map((r) => (
            <li key={r.id} className="panel-pad">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-ink-3 font-bold">{formatJpDate(r.receipt_date)}</span>
                <span className="font-mono font-bold text-[14px] text-navy">
                  ¥{Number(r.amount_yen).toLocaleString("ja-JP")}
                </span>
              </div>
              <div className="text-[12px] mb-1">
                <span className="font-bold">{r.category}</span>
                <span className="text-[10px] text-ink-3 ml-2">
                  {r.payment_method === "company_card" ? "会社カード" : "立替"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px]">
                  {!r.reviewed_at ? (
                    <span className="pill-amber">未確認</span>
                  ) : r.reimbursement_status === "paid" ? (
                    <span className="pill-teal">精算済</span>
                  ) : r.reimbursement_status === "requested" ? (
                    <span className="pill-purple">精算待ち</span>
                  ) : (
                    <span className="pill-blue">確認済</span>
                  )}
                </span>
                {r.photo_url && (
                  <a
                    href={r.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue underline"
                  >
                    画像 →
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
