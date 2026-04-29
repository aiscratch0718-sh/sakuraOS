import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SpVehicleRunsPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: runs } = await supabase
    .from("vehicle_runs")
    .select(
      "id, run_date, distance_km, alcohol_check_result, abnormal, vehicle:vehicles(plate_number, model)",
    )
    .eq("user_id", session.userId)
    .order("run_date", { ascending: false })
    .limit(20);

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <h1 className="text-lg font-extrabold text-navy mb-1">車両運行</h1>
      <p className="text-[11px] text-ink-3 mb-3">
        運行前のアルコールチェック・走行距離・異常を記録します。
      </p>

      <Link
        href="/sp/vehicle-runs/new"
        className="block w-full bg-pink hover:bg-pink-2 transition-colors text-white text-center py-3 rounded-panel text-[14px] font-bold shadow-card mb-4"
      >
        🚗 新規運行記録を作成
      </Link>

      <h2 className="text-[12px] font-bold text-ink-2 tracking-wider mb-2 px-1">
        自分の運行履歴(直近 20 件)
      </h2>

      {!runs || runs.length === 0 ? (
        <div className="panel-pad text-[12px] text-ink-3 text-center py-6">
          まだ運行記録はありません。
        </div>
      ) : (
        <ul className="space-y-2">
          {runs.map((r) => {
            const v = r.vehicle as
              | { plate_number?: string; model?: string }
              | null;
            return (
              <li key={r.id} className="panel-pad">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-ink-3 font-bold">
                    {formatJpDate(r.run_date)}
                  </span>
                  {r.alcohol_check_result === "ok" ? (
                    <span className="pill-teal">アルコール OK</span>
                  ) : r.alcohol_check_result === "warning" ? (
                    <span className="pill-amber">警告</span>
                  ) : (
                    <span className="pill-red">NG</span>
                  )}
                </div>
                <div className="text-[13px] font-bold">
                  {v?.plate_number ?? "—"}{" "}
                  <span className="text-[10px] text-ink-3">
                    {v?.model ?? ""}
                  </span>
                </div>
                <div className="text-[11px] text-ink-2">
                  走行 {Number(r.distance_km ?? 0).toFixed(1)} km
                </div>
                {r.abnormal && (
                  <div className="text-[11px] text-red font-bold mt-1">
                    ⚠ {r.abnormal}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
