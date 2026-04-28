import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createProject } from "@/features/master/actions/project";
import { ProjectForm } from "../ProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/projects");
  }

  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <Link
        href="/pc/projects"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← 現場一覧へ戻る
      </Link>

      <h1 className="text-xl font-extrabold text-navy mb-1">現場を新規登録</h1>
      <p className="text-[12px] text-ink-2 mb-5">
        登録した現場は、作業員の REPORT3 入力で選択できるようになります。
      </p>

      <ProjectForm
        customers={customers ?? []}
        action={createProject}
        submitLabel="登録する"
      />
    </div>
  );
}
