import { redirect } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { TemplateForm } from "./TemplateForm";

export const dynamic = "force-dynamic";

export default async function NewTemplatePage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/contractor-templates");
  }
  const sb = await createClient();
  const { data: customers } = await sb
    .from("customers")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });
  return (
    <div className="px-6 py-6 max-w-2xl mx-auto">
      <Link href="/pc/contractor-templates" className="inline-block text-[12px] text-blue underline mb-3">
        ← 一覧へ戻る
      </Link>
      <h1 className="text-xl font-extrabold text-navy mb-1">元請テンプレートを追加</h1>
      <p className="text-[12px] text-ink-2 mb-5">
        元請さまから共有された書類フォーマット(白紙のもの)を保管します。次回の安全書類作成時に提案されます。
      </p>
      <TemplateForm customers={customers ?? []} tenantId={session.tenantId} />
    </div>
  );
}
