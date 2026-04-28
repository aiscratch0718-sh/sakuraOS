import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpFullDate } from "@/lib/format";
import { ApproveButton } from "../../approvals/ApproveButton";
import { RejectButton } from "../../approvals/RejectButton";

export const dynamic = "force-dynamic";

export default async function Report3DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const supabase = await createClient();

  const { data: entry } = await supabase
    .from("report3_entries")
    .select(
      `
      id, work_date, submitted_at, requires_leader_approval,
      approved_at, approved_by,
      rejected_at, rejected_by, rejection_reason,
      project_id, projects(name),
      submitter:profiles!report3_entries_user_id_fkey(display_name),
      rejecter:profiles!report3_entries_rejected_by_fkey(display_name),
      report3_rows(l1, l2, l3, hours, memo)
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (!entry) {
    notFound();
  }

  const projectName =
    (entry.projects as { name?: string } | null)?.name ?? "(現場名未設定)";
  const submitterName =
    (entry.submitter as { display_name?: string } | null)?.display_name ?? "—";
  const rejecterName =
    (entry.rejecter as { display_name?: string } | null)?.display_name ?? "—";
  const rows =
    (entry.report3_rows as Array<{
      l1: string;
      l2: string;
      l3: string;
      hours: number;
      memo: string | null;
    }> | null) ?? [];
  const totalHours = rows.reduce((s, r) => s + Number(r.hours), 0);

  const isApproved = !!entry.approved_at;
  const isRejected = !!entry.rejected_at;
  const needsApproval =
    entry.requires_leader_approval && !isApproved && !isRejected;
  const canManage = ["leader", "office", "ceo"].includes(session.role);

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <Link
        href="/sp/home"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← ホームへ戻る
      </Link>

      {isRejected && (
        <div className="panel-pad mb-3 bg-red-bg/50 border-red/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="pill-red">差戻し</span>
            <span className="text-[11px] text-ink-3">
              {new Date(entry.rejected_at!).toLocaleString("ja-JP", {
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="text-[13px] font-bold text-red mb-1">
            この日報は {rejecterName} によって差戻されました
          </div>
          <div className="text-[12px] text-ink-2 whitespace-pre-wrap">
            理由: {entry.rejection_reason ?? "(理由なし)"}
          </div>
          <p className="text-[11px] text-ink-3 mt-2">
            ※ 内容を確認し、必要があれば新しい日報として再提出してください。
          </p>
        </div>
      )}

      <div className="panel-pad mb-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-base font-extrabold text-navy">作業日報</h1>
          {isApproved ? (
            <span className="pill-teal">承認済</span>
          ) : isRejected ? (
            <span className="pill-red">差戻し</span>
          ) : needsApproval ? (
            <span className="pill-amber">要承認</span>
          ) : (
            <span className="pill-blue">提出済</span>
          )}
        </div>

        <dl className="space-y-2 text-[13px]">
          <div className="flex">
            <dt className="w-20 text-ink-3 text-[11px] font-bold">作業日</dt>
            <dd className="font-bold">{formatJpFullDate(entry.work_date)}</dd>
          </div>
          <div className="flex">
            <dt className="w-20 text-ink-3 text-[11px] font-bold">現場</dt>
            <dd className="font-bold">{projectName}</dd>
          </div>
          <div className="flex">
            <dt className="w-20 text-ink-3 text-[11px] font-bold">作業員</dt>
            <dd>{submitterName}</dd>
          </div>
          <div className="flex">
            <dt className="w-20 text-ink-3 text-[11px] font-bold">提出</dt>
            <dd className="text-ink-2">
              {new Date(entry.submitted_at).toLocaleString("ja-JP")}
            </dd>
          </div>
        </dl>
      </div>

      <h2 className="text-[12px] font-bold text-ink-2 tracking-wider mb-2 px-1">
        作業内訳({rows.length}行)
      </h2>

      <ul className="space-y-2 mb-3">
        {rows.map((r, idx) => (
          <li key={idx} className="panel-pad">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-ink-3 font-bold tracking-wider">
                行 {idx + 1}
              </span>
              <span className="text-blue font-bold text-[14px]">
                {Number(r.hours)} h
              </span>
            </div>
            <div className="text-[13px] font-bold text-navy">
              {r.l1} / {r.l2}
            </div>
            <div className="text-[12px] text-ink-2">{r.l3}</div>
            {r.memo && (
              <div className="text-[11px] text-ink-3 mt-1.5 whitespace-pre-wrap">
                {r.memo}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div
        className={`text-[13px] font-bold px-3 py-2 rounded-btn ${
          totalHours > 8 ? "bg-amber-bg text-amber" : "bg-blue-bg text-blue"
        }`}
      >
        合計: {totalHours} 時間
      </div>

      {isApproved && (
        <div className="mt-3 panel-pad bg-teal-bg/40 border-teal/30">
          <div className="text-[12px] text-teal font-bold">
            ✓ 承認済(
            {new Date(entry.approved_at!).toLocaleString("ja-JP", {
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            )
          </div>
        </div>
      )}

      {needsApproval && canManage && (
        <div className="mt-4 panel-pad bg-amber-bg/40 border-amber/30">
          <div className="text-[12px] text-amber font-bold mb-2">
            ⚠ この日報は承認待ちです
          </div>
          <div className="space-y-2">
            <ApproveButton entryId={entry.id} />
            <RejectButton entryId={entry.id} className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
