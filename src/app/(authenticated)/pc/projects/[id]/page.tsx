import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { updateProject } from "@/features/master/actions/project";
import { ProjectForm } from "../ProjectForm";
import type { ProjectActionResult } from "@/features/master/schemas";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/projects");
  }

  const supabase = await createClient();
  const [{ data: project }, { data: customers }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, code, name, customer_id, status, started_at, ended_at, contract_amount_cents, note",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("customers")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  if (!project) {
    notFound();
  }

  const action = async (
    prev: ProjectActionResult,
    formData: FormData,
  ): Promise<ProjectActionResult> => {
    "use server";
    return updateProject(id, prev, formData);
  };

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <Link
        href="/pc/projects"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← 現場一覧へ戻る
      </Link>

      <h1 className="text-xl font-extrabold text-navy mb-1">
        現場を編集 — {project.name}
      </h1>
      <p className="text-[12px] text-ink-2 mb-5">
        変更は保存と同時に反映されます。
      </p>

      <ProjectForm
        initial={project}
        customers={customers ?? []}
        action={action}
        submitLabel="更新する"
      />
    </div>
  );
}
