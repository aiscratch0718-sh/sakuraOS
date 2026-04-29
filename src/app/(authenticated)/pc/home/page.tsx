import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpFullDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PcHomePage() {
  const session = await requireSession();
  const supabase = await createClient();

  const today = todayInTokyo();
  const weekStart = startOfWeekJP();
  const monthStart = startOfMonthJP();

  const [
    { count: todayCount },
    { count: weekCount },
    { count: needApprovalCount },
    { data: recent },
    { data: costAggregates },
    { data: monthHoursData },
  ] = await Promise.all([
    supabase
      .from("report3_entries")
      .select("id", { count: "exact", head: true })
      .eq("work_date", today),
    supabase
      .from("report3_entries")
      .select("id", { count: "exact", head: true })
      .gte("work_date", weekStart),
    supabase
      .from("report3_entries")
      .select("id", { count: "exact", head: true })
      .eq("requires_leader_approval", true)
      .is("approved_at", null)
      .is("rejected_at", null),
    supabase
      .from("report3_entries")
      .select(
        "id, work_date, submitted_at, requires_leader_approval, approved_at, rejected_at, project_id, projects(name), submitter:profiles!report3_entries_user_id_fkey(display_name)",
      )
      .order("submitted_at", { ascending: false })
      .limit(15),
    supabase
      .from("project_cost_aggregates")
      .select(
        "project_id, total_hours, total_labor_cost_cents, projects(name, status)",
      )
      .order("total_labor_cost_cents", { ascending: false })
      .limit(8),
    // 今月の累計時間 / 累計人件費を計算するために、今月の日報を全部取得
    supabase
      .from("report3_entries")
      .select("id, user_id, report3_rows(hours)")
      .gte("work_date", monthStart),
  ]);

  // 今月の累計人件費 = 今月の各日報の hours × 該当 user の hourly_rate_cents の合計
  const monthHours = (monthHoursData ?? []).reduce((sum, e) => {
    const rows = (e.report3_rows as Array<{ hours: number }> | null) ?? [];
    return sum + rows.reduce((s, r) => s + Number(r.hours), 0);
  }, 0);

  // ユーザーごとの時給を取得して人件費を概算
  const userIds = Array.from(
    new Set((monthHoursData ?? []).map((e) => e.user_id)),
  );
  let monthLaborYen = 0;
  if (userIds.length > 0) {
    const { data: rates } = await supabase
      .from("profiles")
      .select("id, hourly_rate_cents")
      .in("id", userIds);
    const rateMap = new Map(
      (rates ?? []).map((r) => [r.id, r.hourly_rate_cents ?? 0]),
    );
    monthLaborYen = (monthHoursData ?? []).reduce((sum, e) => {
      const rows = (e.report3_rows as Array<{ hours: number }> | null) ?? [];
      const userHours = rows.reduce((s, r) => s + Number(r.hours), 0);
      const rate = rateMap.get(e.user_id) ?? 0;
      return sum + (userHours * rate) / 100; // cents → yen
    }, 0);
  }

  const isExec = session.role === "ceo";

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-navy">
          {isExec ? "経営ダッシュボード" : "事務ホーム"}
        </h1>
        <p className="text-[12px] text-ink-2 mt-0.5">
          {formatJpFullDate(new Date())}
        </p>
      </div>

      {/* KPI 行 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="kpi-card kpi-blue">
          <div className="text-[11px] text-ink-2 mb-1">本日の日報提出</div>
          <div className="text-[26px] font-extrabold leading-none">
            {todayCount ?? 0}
          </div>
          <div className="text-[11px] text-ink-3 mt-1">件</div>
        </div>
        <div className="kpi-card kpi-teal">
          <div className="text-[11px] text-ink-2 mb-1">今週の日報提出</div>
          <div className="text-[26px] font-extrabold leading-none">
            {weekCount ?? 0}
          </div>
          <div className="text-[11px] text-ink-3 mt-1">件</div>
        </div>
        <div className="kpi-card kpi-amber">
          <div className="text-[11px] text-ink-2 mb-1">未承認(要対応)</div>
          <div className="text-[26px] font-extrabold leading-none">
            {needApprovalCount ?? 0}
          </div>
          <div className="text-[11px] text-ink-3 mt-1">件</div>
        </div>
        <div className="kpi-card kpi-purple">
          <div className="text-[11px] text-ink-2 mb-1">今月の人件費(概算)</div>
          <div className="text-[24px] font-extrabold leading-none whitespace-nowrap">
            ¥{Math.round(monthLaborYen).toLocaleString("ja-JP")}
          </div>
          <div className="text-[11px] text-ink-3 mt-1">
            稼働 {monthHours.toFixed(1)} h
          </div>
        </div>
      </div>

      {/* 現場別 累計原価 */}
      <section className="panel-pad mb-5">
        <h2 className="panel-title">
          <span aria-hidden>💰</span>
          <span>現場別 累計人件費(REPORT3 自動集計)</span>
        </h2>
        {!costAggregates || costAggregates.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-4 text-center">
            日報が提出されると自動で累計されます。
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold">現場</th>
                  <th className="py-2 px-3 font-bold text-right">累計時間</th>
                  <th className="py-2 px-3 font-bold text-right">累計人件費</th>
                </tr>
              </thead>
              <tbody>
                {costAggregates.map((c) => {
                  const projectName =
                    (c.projects as { name?: string } | null)?.name ?? "—";
                  const projectStatus =
                    (c.projects as { status?: string } | null)?.status ??
                    "active";
                  const yen = Math.round(
                    Number(c.total_labor_cost_cents) / 100,
                  );
                  return (
                    <tr
                      key={c.project_id}
                      className="border-b border-line hover:bg-blue-bg/30"
                    >
                      <td className="py-2 px-3 font-bold flex items-center gap-2">
                        {projectName}
                        {projectStatus === "completed" && (
                          <span className="pill-blue">完了</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {Number(c.total_hours).toFixed(1)} h
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        ¥{yen.toLocaleString("ja-JP")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 直近提出 */}
      <section className="panel-pad">
        <h2 className="panel-title">
          <span aria-hidden>📋</span>
          <span>直近の作業日報(全社)</span>
        </h2>

        {!recent || recent.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-4 text-center">
            まだ提出された日報はありません。
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
                  <th className="py-2 px-3 font-bold">状態</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => {
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
                        <Link
                          href={`/sp/report3/${r.id}`}
                          className="hover:underline"
                        >
                          {new Date(r.submitted_at).toLocaleString("ja-JP", {
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Link>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {r.work_date}
                      </td>
                      <td className="py-2 px-3">{userName}</td>
                      <td className="py-2 px-3">{projectName}</td>
                      <td className="py-2 px-3">
                        {pickStatus(r)}
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

function pickStatus(r: {
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

function todayInTokyo(): string {
  const tokyo = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  const y = tokyo.getFullYear();
  const m = String(tokyo.getMonth() + 1).padStart(2, "0");
  const d = String(tokyo.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfWeekJP(): string {
  const tokyo = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  const day = tokyo.getDay() || 7;
  if (day !== 1) tokyo.setDate(tokyo.getDate() - (day - 1));
  const y = tokyo.getFullYear();
  const m = String(tokyo.getMonth() + 1).padStart(2, "0");
  const d = String(tokyo.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfMonthJP(): string {
  const tokyo = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  const y = tokyo.getFullYear();
  const m = String(tokyo.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}
