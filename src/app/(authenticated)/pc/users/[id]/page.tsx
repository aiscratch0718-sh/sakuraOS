import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { updateUserAction } from "@/features/master/actions/user";
import { UserForm } from "../UserForm";
import type { UserActionResult } from "@/features/master/schemas-user";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/users");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role, hourly_rate_cents")
    .eq("id", id)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const action = async (
    prev: UserActionResult,
    formData: FormData,
  ): Promise<UserActionResult> => {
    "use server";
    return updateUserAction(id, prev, formData);
  };

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto">
      <Link
        href="/pc/users"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← ユーザー一覧へ戻る
      </Link>

      <h1 className="text-xl font-extrabold text-navy mb-1">
        ユーザーを編集 — {profile.display_name}
      </h1>
      <p className="text-[12px] text-ink-2 mb-5">
        表示名・ロール・時給を変更できます。
      </p>

      <UserForm
        mode="update"
        initial={profile}
        action={action}
        submitLabel="更新する"
      />
    </div>
  );
}
