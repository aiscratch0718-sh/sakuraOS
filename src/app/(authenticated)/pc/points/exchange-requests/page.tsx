import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Tag } from "@/components/ui/Tag";
import { ExchangeApprovalForm } from "./_components/ExchangeApprovalForm";

export const dynamic = "force-dynamic";

const STATUS_META: Record<
  string,
  { label: string; variant: "p1" | "p2" | "p3" | "neutral" | "gold" }
> = {
  pending: { label: "⏳ 承認待ち", variant: "gold" },
  approved: { label: "✅ 承認済", variant: "p3" },
  rejected: { label: "✕ 却下", variant: "p1" },
  fulfilled: { label: "📦 履行完了", variant: "neutral" },
  cancelled: { label: "🚫 キャンセル", variant: "neutral" },
};

export default async function ExchangeRequestsPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/points");
  }

  const sb = await createClient();
  const { data: requests } = await sb
    .from("exchange_requests")
    .select(
      "id, cost_points, status, created_at, approved_at, rejected_at, fulfilled_at, rejection_reason, user:profiles!exchange_requests_user_id_fkey(display_name), reward:rewards(name, icon)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const pending = (requests ?? []).filter((r) => r.status === "pending");
  const approved = (requests ?? []).filter(
    (r) => r.status === "approved" || r.status === "fulfilled",
  );
  const rejected = (requests ?? []).filter(
    (r) => r.status === "rejected" || r.status === "cancelled",
  );

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      <Link
        href="/pc/points"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← ポイント管理へ戻る
      </Link>
      <div className="mb-5 flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-navy flex items-center gap-2">
            <span aria-hidden>📬</span>交換申請の承認
          </h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            社員からの報酬交換申請を確認・承認します
          </p>
        </div>
        <Tag variant="p1">
          未処理 {pending.length} 件
        </Tag>
      </div>

      {/* 承認待ち */}
      <section className="bg-panel border border-line rounded-panel mb-4 overflow-hidden">
        <header className="px-4 py-3 border-b border-line">
          <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
            <span aria-hidden>⏳</span>承認待ち ({pending.length})
          </h2>
        </header>

        {pending.length === 0 ? (
          <p className="py-8 text-center text-[12px] text-ink-3">
            未処理の申請はありません
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>申請日</th>
                  <th>申請者</th>
                  <th>交換先</th>
                  <th className="text-right">消費pt</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => {
                  const userName =
                    (Array.isArray(r.user)
                      ? r.user[0]?.display_name
                      : (r.user as { display_name?: string } | null)?.display_name) ?? "—";
                  const reward = Array.isArray(r.reward)
                    ? r.reward[0]
                    : (r.reward as { name?: string; icon?: string } | null);
                  return (
                    <tr key={r.id as string}>
                      <td className="text-[11px] text-ink-2 whitespace-nowrap">
                        {formatDate(r.created_at as string)}
                      </td>
                      <td className="font-bold">{userName}</td>
                      <td>
                        <span className="mr-1" aria-hidden>
                          {reward?.icon ?? "🎁"}
                        </span>
                        {reward?.name ?? "—"}
                      </td>
                      <td className="text-right font-mono font-bold text-p1">
                        −{(r.cost_points as number).toLocaleString("ja-JP")}pt
                      </td>
                      <td>
                        <ExchangeApprovalForm requestId={r.id as string} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 承認済み */}
      <section className="bg-panel border border-line rounded-panel mb-4 overflow-hidden">
        <header className="px-4 py-3 border-b border-line">
          <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
            <span aria-hidden>✅</span>承認済 ({approved.length})
          </h2>
        </header>

        {approved.length === 0 ? (
          <p className="py-8 text-center text-[12px] text-ink-3">
            承認済の申請はありません
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>承認日</th>
                  <th>申請者</th>
                  <th>交換先</th>
                  <th className="text-right">消費pt</th>
                  <th>状態</th>
                </tr>
              </thead>
              <tbody>
                {approved.map((r) => {
                  const userName =
                    (Array.isArray(r.user)
                      ? r.user[0]?.display_name
                      : (r.user as { display_name?: string } | null)?.display_name) ?? "—";
                  const reward = Array.isArray(r.reward)
                    ? r.reward[0]
                    : (r.reward as { name?: string; icon?: string } | null);
                  const meta = STATUS_META[r.status as string] ?? {
                    label: r.status as string,
                    variant: "neutral" as const,
                  };
                  return (
                    <tr key={r.id as string}>
                      <td className="text-[11px] text-ink-2 whitespace-nowrap">
                        {r.approved_at ? formatDate(r.approved_at as string) : "—"}
                      </td>
                      <td className="font-bold">{userName}</td>
                      <td>
                        <span className="mr-1" aria-hidden>
                          {reward?.icon ?? "🎁"}
                        </span>
                        {reward?.name ?? "—"}
                      </td>
                      <td className="text-right font-mono">
                        −{(r.cost_points as number).toLocaleString("ja-JP")}pt
                      </td>
                      <td>
                        <Tag variant={meta.variant}>{meta.label}</Tag>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 却下/キャンセル */}
      {rejected.length > 0 && (
        <section className="bg-panel border border-line rounded-panel overflow-hidden">
          <header className="px-4 py-3 border-b border-line">
            <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
              <span aria-hidden>✕</span>却下/キャンセル ({rejected.length})
            </h2>
          </header>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>処理日</th>
                  <th>申請者</th>
                  <th>交換先</th>
                  <th>理由</th>
                </tr>
              </thead>
              <tbody>
                {rejected.map((r) => {
                  const userName =
                    (Array.isArray(r.user)
                      ? r.user[0]?.display_name
                      : (r.user as { display_name?: string } | null)?.display_name) ?? "—";
                  const reward = Array.isArray(r.reward)
                    ? r.reward[0]
                    : (r.reward as { name?: string; icon?: string } | null);
                  return (
                    <tr key={r.id as string}>
                      <td className="text-[11px] text-ink-2 whitespace-nowrap">
                        {r.rejected_at ? formatDate(r.rejected_at as string) : "—"}
                      </td>
                      <td className="font-bold">{userName}</td>
                      <td>{reward?.name ?? "—"}</td>
                      <td className="text-[11px] text-ink-2">
                        {(r.rejection_reason as string) ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const dt = new Date(iso);
  return dt.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
