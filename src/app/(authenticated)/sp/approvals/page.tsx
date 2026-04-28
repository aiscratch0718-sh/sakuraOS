import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";
import { ApproveButton } from "./ApproveButton";
import { RejectButton } from "./RejectButton";

export const dynamic = "force-dynamic";

export default async function SpApprovalsPage() {
  const session = await requireSession();

  if (!["leader", "office", "ceo"].includes(session.role)) {
    redirect("/sp/home");
  }

  const supabase = await createClient();

  const { data: pending } = await supabase
    .from("report3_entries")
    .select(
      "id, work_date, submitted_at, project_id, projects(name), submitter:profiles!report3_entries_user_id_fkey(display_name)",
    )
    .eq("requires_leader_approval", true)
    .is("approved_at", null)
    .is("rejected_at", null)
    .order("submitted_at", { ascending: true })
    .limit(50);

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <Link
        href="/sp/home"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← ホームへ戻る
      </Link>

      <h1 className="text-lg font-extrabold text-navy mb-1">承認待ち日報</h1>
      <p className="text-[11px] text-ink-3 mb-4">
        8時間超の作業日報はリーダー承認が必要です
      </p>

      {!pending || pending.length === 0 ? (
        <div className="panel-pad text-[12px] text-ink-3 text-center py-8">
          現在、承認待ちの日報はありません。
        </div>
      ) : (
        <ul className="space-y-3">
          {pending.map((r) => {
            const projectName =
              (r.projects as { name?: string } | null)?.name ?? "—";
            const userName =
              (r.submitter as { display_name?: string } | null)
                ?.display_name ?? "—";
            return (
              <li key={r.id} className="panel-pad">
                <div className="flex items-center justify-between mb-2">
                  <span className="pill-amber">要承認</span>
                  <span className="text-[10px] text-ink-3">
                    {formatJpDate(r.work_date)}
                  </span>
                </div>
                <div className="text-[13px] font-bold text-navy mb-0.5">
                  {userName}
                </div>
                <div className="text-[12px] text-ink-2 mb-3">{projectName}</div>
                <div className="flex gap-2">
                  <Link
                    href={`/sp/report3/${r.id}`}
                    className="flex-1 btn-ghost py-2 text-center text-[12px]"
                  >
                    詳細
                  </Link>
                  <RejectButton entryId={r.id} className="flex-1 text-center" />
                  <div className="flex-1">
                    <ApproveButton entryId={r.id} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
