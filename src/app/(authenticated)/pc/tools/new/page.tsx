import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createTool } from "@/features/tools/actions";
import { ToolForm } from "./ToolForm";

export const dynamic = "force-dynamic";

export default async function NewToolPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/tools");
  }

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto">
      <Link
        href="/pc/tools"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← 工具一覧へ戻る
      </Link>

      <h1 className="text-xl font-extrabold text-navy mb-1">工具を新規登録</h1>
      <p className="text-[12px] text-ink-2 mb-5">
        登録した工具には自動で QR トークンが発行され、SP 画面から持出/返却できます。
      </p>

      <ToolForm action={createTool} />
    </div>
  );
}
