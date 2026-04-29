import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const SEV_META: Record<string, { label: string; cls: string }> = {
  low: { label: "低", cls: "pill-blue" },
  medium: { label: "中", cls: "pill-amber" },
  high: { label: "高", cls: "pill-red" },
  critical: { label: "緊急", cls: "pill-red" },
};

export default async function PcIncidentsPage() {
  const session = await requireSession();
  if (!["leader", "office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }

  const supabase = await createClient();

  const { data: incidents } = await supabase
    .from("incident_reports")
    .select(
      `
      id, occurred_at, severity, category, what_happened, status, photo_url, photo_lat, photo_lng,
      reporter:profiles!incident_reports_reporter_id_fkey(display_name),
      project:projects(name)
      `,
    )
    .order("status", { ascending: true })  // open → resolved → dismissed
    .order("occurred_at", { ascending: false })
    .limit(200);

  const openCount = (incidents ?? []).filter((i) => i.status === "open").length;

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-navy">ヒヤリハット報告</h1>
        <p className="text-[12px] text-ink-2 mt-0.5">
          全社の報告(直近 200 件)。対応中: <strong className="text-amber">{openCount} 件</strong>
        </p>
      </div>

      <section className="panel-pad">
        {!incidents || incidents.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            報告はまだありません。
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold">発生日時</th>
                  <th className="py-2 px-3 font-bold">危険度</th>
                  <th className="py-2 px-3 font-bold">カテゴリ</th>
                  <th className="py-2 px-3 font-bold">報告者</th>
                  <th className="py-2 px-3 font-bold">現場</th>
                  <th className="py-2 px-3 font-bold">内容</th>
                  <th className="py-2 px-3 font-bold">状態</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((i) => {
                  const sev = SEV_META[i.severity] ?? SEV_META.medium;
                  const reporter =
                    (i.reporter as { display_name?: string } | null)
                      ?.display_name ?? "—";
                  const projectName =
                    (i.project as { name?: string } | null)?.name ?? "—";
                  return (
                    <tr key={i.id} className="border-b border-line align-top">
                      <td className="py-2 px-3 text-[11px] text-ink-2 whitespace-nowrap">
                        {new Date(i.occurred_at).toLocaleString("ja-JP")}
                      </td>
                      <td className="py-2 px-3">
                        <span className={sev?.cls ?? "pill-blue"}>{sev?.label ?? "中"}</span>
                      </td>
                      <td className="py-2 px-3 text-[11px]">
                        {i.category ?? "—"}
                      </td>
                      <td className="py-2 px-3 font-bold">{reporter}</td>
                      <td className="py-2 px-3">{projectName}</td>
                      <td className="py-2 px-3 max-w-md">
                        <div className="line-clamp-2 text-[12px]">
                          {i.what_happened}
                        </div>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {i.status === "open" ? (
                          <span className="pill-amber">対応中</span>
                        ) : i.status === "resolved" ? (
                          <span className="pill-teal">対応済</span>
                        ) : (
                          <span className="pill-blue">対象外</span>
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
    </div>
  );
}
