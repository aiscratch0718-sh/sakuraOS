import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createUserAction } from "@/features/master/actions/user";
import { UserForm } from "../UserForm";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/users");
  }

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto">
      <Link
        href="/pc/users"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← ユーザー一覧へ戻る
      </Link>

      <h1 className="text-xl font-extrabold text-navy mb-1">ユーザーを新規登録</h1>
      <p className="text-[12px] text-ink-2 mb-5">
        登録すると即座にログイン可能になります。本人にメールとパスワードを連絡してください。
      </p>

      <UserForm mode="create" action={createUserAction} submitLabel="登録する" />
    </div>
  );
}
