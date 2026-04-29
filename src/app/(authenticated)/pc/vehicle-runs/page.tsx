import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PcVehicleRunsPage() {
  const session = await requireSession();
  if (!["leader", "office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }
  const supabase = await createClient();

  const { data: runs } = await supabase
    .from("vehicle_runs")
    .select(
      `
      id, run_date, distance_km, alcohol_check_result, alcohol_check_value, abnormal,
      vehicle:vehicles(plate_number, model),
      driver:profiles!vehicle_runs_user_id_fkey(display_name),
      project:projects(name)
      `,
    )
    .order("run_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">車両運行記録</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            全社の運行記録(直近 200 件)。アルコールチェック・走行距離・異常を集計。
          </p>
        </div>
        <Link href="/pc/vehicles" className="btn-ghost py-2 px-4 text-[13px]">
          車両一覧へ
        </Link>
      </div>

      <section className="panel-pad">
        {!runs || runs.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            運行記録はまだありません。
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold">運行日</th>
                  <th className="py-2 px-3 font-bold">運転者</th>
                  <th className="py-2 px-3 font-bold">車両</th>
                  <th className="py-2 px-3 font-bold">現場</th>
                  <th className="py-2 px-3 font-bold text-right">走行 (km)</th>
                  <th className="py-2 px-3 font-bold">アルコール</th>
                  <th className="py-2 px-3 font-bold">異常</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => {
                  const v = r.vehicle as
                    | { plate_number?: string; model?: string }
                    | null;
                  const driver =
                    (r.driver as { display_name?: string } | null)
                      ?.display_name ?? "—";
                  const projectName =
                    (r.project as { name?: string } | null)?.name ?? "—";
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-line hover:bg-blue-bg/30"
                    >
                      <td className="py-2 px-3 whitespace-nowrap">
                        {formatJpDate(r.run_date)}
                      </td>
                      <td className="py-2 px-3 font-bold">{driver}</td>
                      <td className="py-2 px-3 text-[12px]">
                        {v?.plate_number ?? "—"}
                        <span className="text-[10px] text-ink-3 ml-1">
                          {v?.model ?? ""}
                        </span>
                      </td>
                      <td className="py-2 px-3">{projectName}</td>
                      <td className="py-2 px-3 text-right font-mono">
                        {Number(r.distance_km ?? 0).toFixed(1)}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {r.alcohol_check_result === "ok" ? (
                          <span className="pill-teal">OK</span>
                        ) : r.alcohol_check_result === "warning" ? (
                          <span className="pill-amber">警告</span>
                        ) : (
                          <span className="pill-red">NG</span>
                        )}
                        {r.alcohol_check_value != null && (
                          <span className="text-[10px] text-ink-3 ml-1 font-mono">
                            ({Number(r.alcohol_check_value).toFixed(2)})
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-red">
                        {r.abnormal ?? ""}
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
