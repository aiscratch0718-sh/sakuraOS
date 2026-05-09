import { redirect } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SafetyDocForm } from "./SafetyDocForm";

export const dynamic = "force-dynamic";

export default async function NewSafetyDocPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/safety-documents");
  }
  const sb = await createClient();
  const [{ data: projects }, { data: customers }, { data: templates }] = await Promise.all([
    sb
      .from("projects")
      .select("id, name, customer_id")
      .order("name", { ascending: true }),
    sb
      .from("customers")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    sb
      .from("contractor_templates")
      .select("id, customer_id, template_name, template_url, template_type, last_used_at")
      .eq("is_active", true)
      .order("last_used_at", { ascending: false, nullsFirst: false }),
  ]);

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <Link href="/pc/safety-documents" className="inline-block text-[12px] text-blue underline mb-3">
        ← 一覧へ戻る
      </Link>
      <h1 className="text-xl font-extrabold text-navy mb-1">安全書類を作成</h1>
      <p className="text-[12px] text-ink-2 mb-5">
        案件を選ぶと、元請(顧客)に紐付くテンプレートが提案されます。
      </p>
      <SafetyDocForm
        projects={projects ?? []}
        customers={customers ?? []}
        templates={templates ?? []}
        tenantId={session.tenantId}
      />
    </div>
  );
}
