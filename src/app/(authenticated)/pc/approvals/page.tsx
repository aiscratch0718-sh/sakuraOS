import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";
import { ApproveButton } from "./ApproveButton";
import { RejectButton } from "./RejectButton";

export const dynamic = "force-dynamic";

export default async function PcApprovalsPage() {
  const session = await requireSession();

  if (!["leader", "office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
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
    .limit(100);

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-navy">承認待ち日報</h1>
        <p className="text-[12px] text-ink-2 mt-0.5">
          8時間超の作業日報を一覧表示しています。差戻しの場合は理由を入力してください。
        </p>
      </div>

      <section className="panel-pad">
        {!pending || pending.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            現在、承認待ちの日報はありません。
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold">提出日時</th>
                  <th className="py-2 px-3 font-bold">作業日</th>
                  <th className="py-2 px-3 font-bold">作業員</th>
                  <th className="py-2 px-3 font-bold">現場</th>
                  <th className="py-2 px-3 font-bold text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => {
                  const projectName =
                    (r.projects as { name?: string } | null)?.name ?? "—";
                  const userName =
                    (r.submitter as { display_name?: string } | null)
                      ?.display_name ?? "—";
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-line hover:bg-blue-bg/30"
                    >
                      <td className="py-2 px-3 text-ink-2 whitespace-nowrap">
                        {new Date(r.submitted_at).toLocaleString("ja-JP", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {formatJpDate(r.work_date)}
                      </td>
                      <td className="py-2 px-3 font-bold">{userName}</td>
                      <td className="py-2 px-3">{projectName}</td>
                      <td className="py-2 px-3 text-right whitespace-nowrap relative">
                        <Link
                          href={`/sp/report3/${r.id}`}
                          className="text-[11px] text-blue underline mr-3"
                        >
                          詳細
                        </Link>
                        <span className="inline-block mr-3 align-middle">
                          <RejectButton entryId={r.id} />
                        </span>
                        <ApproveButton entryId={r.id} />
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
