import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  draft: { label: "下書き", cls: "pill-blue" },
  submitted: { label: "提出済", cls: "pill-amber" },
  approved: { label: "承認済", cls: "pill-teal" },
};

export default async function SafetyDocsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const session = await requireSession();
  if (!["leader", "office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }
  const params = await searchParams;
  const sb = await createClient();

  const [{ data: docs }, { data: projects }] = await Promise.all([
    (params.project
      ? sb
          .from("safety_documents")
          .select(
            "id, project_id, recipient_type, recipient_name, document_name, file_url, status, submitted_at, created_at, project:projects(name)",
          )
          .eq("project_id", params.project)
          .order("created_at", { ascending: false })
      : sb
          .from("safety_documents")
          .select(
            "id, project_id, recipient_type, recipient_name, document_name, file_url, status, submitted_at, created_at, project:projects(name)",
          )
          .order("created_at", { ascending: false })
          .limit(200)),
    sb
      .from("projects")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  const canEdit = ["office", "ceo", "system"].includes(session.role);
  const draftCount = (docs ?? []).filter((d) => d.status === "draft").length;
  const submittedCount = (docs ?? []).filter((d) => d.status === "submitted").length;

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy">安全書類管理</h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            元請さま・協力会社さまとの工事開始前書類を管理します。USER マスタの資格情報を元に作成されます。
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/pc/contractor-templates" className="btn-ghost py-2 px-3 text-[12px]">
            📁 元請テンプレート
          </Link>
          {canEdit && (
            <Link href="/pc/safety-documents/new" className="btn-primary py-2 px-4 text-[13px]">
              + 書類を作成
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="kpi-card kpi-blue">
          <div className="text-[11px] text-ink-2 mb-1">下書き</div>
          <div className="text-[22px] font-extrabold leading-none">{draftCount}</div>
          <div className="text-[10px] text-ink-3 mt-1">件</div>
        </div>
        <div className="kpi-card kpi-amber">
          <div className="text-[11px] text-ink-2 mb-1">提出済(承認待ち)</div>
          <div className="text-[22px] font-extrabold leading-none">{submittedCount}</div>
          <div className="text-[10px] text-ink-3 mt-1">件</div>
        </div>
        <div className="kpi-card kpi-teal">
          <div className="text-[11px] text-ink-2 mb-1">合計</div>
          <div className="text-[22px] font-extrabold leading-none">{docs?.length ?? 0}</div>
          <div className="text-[10px] text-ink-3 mt-1">件</div>
        </div>
      </div>

      {/* 案件フィルタ */}
      <form method="get" className="panel-pad flex items-end gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-ink-2 mb-1">案件で絞り込み</label>
          <select name="project" defaultValue={params.project ?? ""} className="input">
            <option value="">— すべて —</option>
            {(projects ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary py-2 px-4 text-[12px]">表示</button>
      </form>

      <section className="panel-pad">
        {!docs || docs.length === 0 ? (
          <p className="text-[12px] text-ink-3 py-8 text-center">
            安全書類はまだ作成されていません。
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-navy bg-blue-bg">
                  <th className="py-2 px-3 font-bold">作成日</th>
                  <th className="py-2 px-3 font-bold">案件</th>
                  <th className="py-2 px-3 font-bold">提出先区分</th>
                  <th className="py-2 px-3 font-bold">提出先</th>
                  <th className="py-2 px-3 font-bold">書類名</th>
                  <th className="py-2 px-3 font-bold">状態</th>
                  <th className="py-2 px-3 font-bold">ファイル</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => {
                  const meta = STATUS_LABEL[d.status] ?? { label: d.status, cls: "pill-blue" };
                  const projectName = (d.project as { name?: string } | null)?.name ?? "—";
                  return (
                    <tr key={d.id} className="border-b border-line hover:bg-blue-bg/30">
                      <td className="py-2 px-3 text-[11px] text-ink-2 whitespace-nowrap">
                        {formatJpDate(d.created_at)}
                      </td>
                      <td className="py-2 px-3 font-bold">{projectName}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {d.recipient_type === "contractor" ? (
                          <span className="pill-purple">元請</span>
                        ) : (
                          <span className="pill-amber">協力会社</span>
                        )}
                      </td>
                      <td className="py-2 px-3">{d.recipient_name}</td>
                      <td className="py-2 px-3">{d.document_name}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={meta.cls}>{meta.label}</span>
                      </td>
                      <td className="py-2 px-3">
                        {d.file_url ? (
                          <a
                            href={d.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue underline"
                          >
                            開く →
                          </a>
                        ) : (
                          <span className="text-[10px] text-ink-3">—</span>
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
