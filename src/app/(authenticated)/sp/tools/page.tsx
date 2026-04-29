import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ToolActionButtons } from "./ToolActionButtons";

export const dynamic = "force-dynamic";

export default async function SpToolsPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const [{ data: tools }, { data: projects }] = await Promise.all([
    supabase
      .from("tools")
      .select(
        "id, tool_code, name, category, status, current_user_id, current_project:projects!tools_current_project_id_fkey(name)",
      )
      .eq("is_active", true)
      .order("status", { ascending: true })
      .order("tool_code", { ascending: true }),
    supabase
      .from("projects")
      .select("id, name")
      .eq("status", "active")
      .order("name", { ascending: true }),
  ]);

  const myCheckedOut = (tools ?? []).filter(
    (t) => t.current_user_id === session.userId && t.status === "checked_out",
  );

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <h1 className="text-lg font-extrabold text-navy mb-1">工具管理</h1>
      <p className="text-[11px] text-ink-3 mb-3">
        持出 / 返却ボタンで工具の動きを記録します。
      </p>

      {myCheckedOut.length > 0 && (
        <section className="panel-pad mb-4 bg-amber-bg/30 border-amber/30">
          <h2 className="text-[12px] font-bold text-amber mb-2">
            🛠️ あなたが持出中({myCheckedOut.length})
          </h2>
          <ul className="space-y-2">
            {myCheckedOut.map((t) => {
              const projectName =
                (t.current_project as { name?: string } | null)?.name ?? "—";
              return (
                <li
                  key={t.id}
                  className="bg-white p-2 rounded-btn flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold truncate">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-ink-3">
                      {t.tool_code} • {projectName}
                    </div>
                  </div>
                  <ToolActionButtons
                    toolId={t.id}
                    status={t.status}
                    isMine
                    projects={projects ?? []}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <h2 className="text-[12px] font-bold text-ink-2 tracking-wider mb-2 px-1">
        全工具一覧
      </h2>
      {!tools || tools.length === 0 ? (
        <div className="panel-pad text-[12px] text-ink-3 text-center py-6">
          工具が登録されていません。
        </div>
      ) : (
        <ul className="space-y-2">
          {tools.map((t) => {
            const projectName =
              (t.current_project as { name?: string } | null)?.name ?? null;
            return (
              <li key={t.id} className="panel-pad">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`pill ${
                      t.status === "in_warehouse"
                        ? "pill-teal"
                        : t.status === "checked_out"
                          ? "pill-amber"
                          : "pill-blue"
                    }`}
                  >
                    {t.status === "in_warehouse"
                      ? "倉庫"
                      : t.status === "checked_out"
                        ? "持出中"
                        : t.status === "maintenance"
                          ? "整備中"
                          : "廃棄"}
                  </span>
                  <span className="text-[10px] text-ink-3 font-mono">
                    {t.tool_code}
                  </span>
                </div>
                <div className="text-[13px] font-bold mb-2">{t.name}</div>
                {projectName && (
                  <div className="text-[10px] text-ink-3 mb-2">
                    現在: {projectName}
                  </div>
                )}
                <ToolActionButtons
                  toolId={t.id}
                  status={t.status}
                  isMine={t.current_user_id === session.userId}
                  projects={projects ?? []}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
