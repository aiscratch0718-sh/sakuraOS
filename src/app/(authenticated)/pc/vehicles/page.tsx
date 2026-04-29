import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PcVehiclesPage() {
  const session = await requireSession();
  const canEdit = ["office", "ceo", "system"].includes(session.role);
  const supabase = await createClient();

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, plate_number, model, status, note, created_at")
    .eq("is_active", true)
    .order("status", { ascending: true })
    .order("plate_number", { ascending: true });

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">車両管理</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            社用車の一覧。運行記録は SP 画面の「車両運行」から作業員が記録します。
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/pc/vehicle-runs"
            className="btn-ghost py-2 px-4 text-[13px]"
          >
            運行記録一覧
          </Link>
          {canEdit && (
            <Link
              href="/pc/vehicles/new"
              className="btn-primary py-2 px-4 text-[13px]"
            >
              + 車両を追加
            </Link>
          )}
        </div>
      </div>

      <section className="panel-pad">
        {!vehicles || vehicles.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            まだ車両が登録されていません。
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold">ナンバー</th>
                  <th className="py-2 px-3 font-bold">車種</th>
                  <th className="py-2 px-3 font-bold">状態</th>
                  <th className="py-2 px-3 font-bold">備考</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-line hover:bg-blue-bg/30"
                  >
                    <td className="py-2 px-3 font-mono text-[12px] font-bold">
                      {v.plate_number}
                    </td>
                    <td className="py-2 px-3">{v.model ?? "—"}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {v.status === "available" ? (
                        <span className="pill-teal">利用可</span>
                      ) : v.status === "in_use" ? (
                        <span className="pill-amber">使用中</span>
                      ) : v.status === "maintenance" ? (
                        <span className="pill-blue">整備中</span>
                      ) : (
                        <span className="pill-red">廃車</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-[11px] text-ink-2">
                      {v.note ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
