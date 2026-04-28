import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpFullDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PcHomePage() {
  const session = await requireSession();
  const supabase = await createClient();

  // Aggregations (Phase B is intentionally minimal — many KPIs are placeholders)
  const today = todayInTokyo();
  const weekStart = startOfWeekJP();

  const [{ count: todayCount }, { count: weekCount }, { count: needApprovalCount }, { data: recent }] =
    await Promise.all([
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
        .is("approved_at", null),
      supabase
        .from("report3_entries")
        .select(
          "id, work_date, submitted_at, requires_leader_approval, project_id, projects(name), submitter:profiles!report3_entries_user_id_fkey(display_name)",
        )
        .order("submitted_at", { ascending: false })
        .limit(15),
    ]);

  const isExec = session.role === "ceo";

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      {/* 見出し */}
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
          <div className="text-[26px] font-extrabold leading-none">{todayCount ?? 0}</div>
          <div className="text-[11px] text-ink-3 mt-1">件</div>
        </div>
        <div className="kpi-card kpi-teal">
          <div className="text-[11px] text-ink-2 mb-1">今週の日報提出</div>
          <div className="text-[26px] font-extrabold leading-none">{weekCount ?? 0}</div>
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
          <div className="text-[11px] text-ink-2 mb-1">原価可視化</div>
          <div className="text-[26px] font-extrabold leading-none text-ink-3">—</div>
          <div className="text-[11px] text-ink-3 mt-1">第3段階で実装</div>
        </div>
      </div>

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
                  <th className="py-2 px-3 font-bold">承認</th>
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
                    <tr key={r.id} className="border-b border-line hover:bg-blue-bg/30">
                      <td className="py-2 px-3 text-ink-2 whitespace-nowrap">
                        {new Date(r.submitted_at).toLocaleString("ja-JP", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {r.work_date}
                      </td>
                      <td className="py-2 px-3">{userName}</td>
                      <td className="py-2 px-3">{projectName}</td>
                      <td className="py-2 px-3">
                        {r.requires_leader_approval ? (
                          <span className="pill-amber">要承認</span>
                        ) : (
                          <span className="pill-teal">完了</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-5 text-[11px] text-ink-3">
        ※ Phase B(MVP骨格)— 工事概況表・現場別原価管理・客先別売上・KPI 詳細は Beta(第3段階)以降で実装。
      </p>
    </div>
  );
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
  // ISO week starts Monday
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
