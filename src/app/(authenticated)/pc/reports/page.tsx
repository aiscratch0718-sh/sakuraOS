import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";
import { ReportFilters } from "./ReportFilters";

export const dynamic = "force-dynamic";

type SearchParams = {
  from?: string;
  to?: string;
  project?: string;
  user?: string;
  status?: "all" | "pending" | "approved" | "rejected" | "submitted";
};

export default async function PcReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireSession();

  if (!["leader", "office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }

  const params = await searchParams;
  const supabase = await createClient();

  // 絞り込み元となるマスタ取得(並列)
  const [{ data: projects }, { data: workers }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name")
      .order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, display_name")
      .order("display_name", { ascending: true }),
  ]);

  // 検索クエリ構築
  let query = supabase
    .from("report3_entries")
    .select(
      `
      id, work_date, submitted_at, requires_leader_approval,
      approved_at, rejected_at, rejection_reason,
      project_id, projects(name),
      submitter:profiles!report3_entries_user_id_fkey(display_name),
      report3_rows(hours)
      `,
    )
    .order("work_date", { ascending: false })
    .order("submitted_at", { ascending: false })
    .limit(200);

  if (params.from) query = query.gte("work_date", params.from);
  if (params.to) query = query.lte("work_date", params.to);
  if (params.project) query = query.eq("project_id", params.project);
  if (params.user) query = query.eq("user_id", params.user);

  switch (params.status) {
    case "pending":
      query = query
        .eq("requires_leader_approval", true)
        .is("approved_at", null)
        .is("rejected_at", null);
      break;
    case "approved":
      query = query.not("approved_at", "is", null);
      break;
    case "rejected":
      query = query.not("rejected_at", "is", null);
      break;
    case "submitted":
      query = query
        .eq("requires_leader_approval", false)
        .is("rejected_at", null);
      break;
  }

  const { data: reports } = await query;

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-navy">日報一覧</h1>
        <p className="text-[12px] text-ink-2 mt-0.5">
          全社の日報を期間・現場・作業員・ステータスで絞り込みできます。
        </p>
      </div>

      <ReportFilters projects={projects ?? []} workers={workers ?? []} />

      <section className="panel-pad">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-ink-2 font-bold">
            検索結果: {reports?.length ?? 0} 件
            {reports?.length === 200 && (
              <span className="text-[10px] text-ink-3 font-normal ml-1">
                (200件で打ち切り — 期間を絞ってください)
              </span>
            )}
          </span>
        </div>

        {!reports || reports.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            条件に合う日報はありません。
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold">作業日</th>
                  <th className="py-2 px-3 font-bold">作業員</th>
                  <th className="py-2 px-3 font-bold">現場</th>
                  <th className="py-2 px-3 font-bold text-right">時間</th>
                  <th className="py-2 px-3 font-bold">状態</th>
                  <th className="py-2 px-3 font-bold">操作</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const projectName =
                    (r.projects as { name?: string } | null)?.name ?? "—";
                  const userName =
                    (r.submitter as { display_name?: string } | null)
                      ?.display_name ?? "—";
                  const totalHours =
                    (r.report3_rows as Array<{ hours: number }> | null)?.reduce(
                      (s, row) => s + Number(row.hours),
                      0,
                    ) ?? 0;
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-line hover:bg-blue-bg/30"
                    >
                      <td className="py-2 px-3 whitespace-nowrap">
                        {formatJpDate(r.work_date)}
                      </td>
                      <td className="py-2 px-3 font-bold">{userName}</td>
                      <td className="py-2 px-3">{projectName}</td>
                      <td className="py-2 px-3 text-right font-mono whitespace-nowrap">
                        {totalHours} h
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {pickStatusBadge(r)}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <Link
                          href={`/sp/report3/${r.id}`}
                          className="text-[11px] text-blue underline"
                        >
                          詳細
                        </Link>
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

function pickStatusBadge(r: {
  approved_at: string | null;
  rejected_at: string | null;
  requires_leader_approval: boolean;
}) {
  if (r.rejected_at) return <span className="pill-red">差戻し</span>;
  if (r.approved_at) return <span className="pill-teal">承認済</span>;
  if (r.requires_leader_approval)
    return <span className="pill-amber">要承認</span>;
  return <span className="pill-blue">提出済</span>;
}
