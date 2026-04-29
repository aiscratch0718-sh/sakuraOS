import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SEV_LABEL: Record<string, { label: string; cls: string }> = {
  low: { label: "低", cls: "pill-blue" },
  medium: { label: "中", cls: "pill-amber" },
  high: { label: "高", cls: "pill-red" },
  critical: { label: "緊急", cls: "pill-red" },
};

export default async function SpIncidentsPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: incidents } = await supabase
    .from("incident_reports")
    .select(
      "id, occurred_at, severity, category, what_happened, status, project:projects(name)",
    )
    .eq("reporter_id", session.userId)
    .order("occurred_at", { ascending: false })
    .limit(20);

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <h1 className="text-lg font-extrabold text-navy mb-1">ヒヤリハット</h1>
      <p className="text-[11px] text-ink-3 mb-3">
        小さな「あぶなかった」を共有することで重大事故を防ぎます。報告で +30 XP。
      </p>

      <Link
        href="/sp/incidents/new"
        className="block w-full bg-amber hover:bg-amber-2 transition-colors text-white text-center py-3 rounded-panel text-[14px] font-bold shadow-card mb-4"
      >
        ⚠ 新規報告を作成
      </Link>

      <h2 className="text-[12px] font-bold text-ink-2 tracking-wider mb-2 px-1">
        自分の報告履歴
      </h2>

      {!incidents || incidents.length === 0 ? (
        <div className="panel-pad text-[12px] text-ink-3 text-center py-6">
          まだ報告はありません。
        </div>
      ) : (
        <ul className="space-y-2">
          {incidents.map((i) => {
            const sev = SEV_LABEL[i.severity] ?? SEV_LABEL.medium;
            const projectName =
              (i.project as { name?: string } | null)?.name ?? "—";
            return (
              <li key={i.id} className="panel-pad">
                <div className="flex items-center justify-between mb-1">
                  <span className={sev?.cls ?? "pill-blue"}>{sev?.label ?? "中"}</span>
                  <span className="text-[10px] text-ink-3">
                    {new Date(i.occurred_at).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                <div className="text-[11px] text-ink-3 mb-0.5">
                  {projectName} · {i.category ?? "—"}
                </div>
                <div className="text-[12px] line-clamp-2">
                  {i.what_happened}
                </div>
                <div className="text-[10px] text-ink-3 mt-1">
                  {i.status === "open"
                    ? "対応中"
                    : i.status === "resolved"
                      ? "✓ 対応済"
                      : "対象外"}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
