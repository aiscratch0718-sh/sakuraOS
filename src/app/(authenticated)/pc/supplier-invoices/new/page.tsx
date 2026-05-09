import { redirect } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SupplierInvoiceForm } from "./SupplierInvoiceForm";

export const dynamic = "force-dynamic";

export default async function NewSupplierInvoicePage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/supplier-invoices");
  }
  const sb = await createClient();
  const { data: projects } = await sb
    .from("projects")
    .select("id, name")
    .order("name", { ascending: true });
  return (
    <div className="px-6 py-6 max-w-2xl mx-auto">
      <Link href="/pc/supplier-invoices" className="inline-block text-[12px] text-blue underline mb-3">
        ← 一覧へ戻る
      </Link>
      <h1 className="text-xl font-extrabold text-navy mb-5">仕入先・協力会社請求書の入力</h1>
      <SupplierInvoiceForm projects={projects ?? []} />
    </div>
  );
}
