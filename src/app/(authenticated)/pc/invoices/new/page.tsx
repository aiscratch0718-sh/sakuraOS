import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createInvoice } from "@/features/billing/actions/invoice";
import { InvoiceForm } from "../InvoiceForm";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/invoices");
  }

  const supabase = await createClient();
  const [{ data: customers }, { data: projects }, { data: stamps }] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, name")
        .eq("is_active", true)
        .order("name", { ascending: true }),
      supabase
        .from("projects")
        .select("id, name")
        .order("name", { ascending: true }),
      supabase
        .from("approval_stamps")
        .select(
          "stamp_key, display_name, role_name, image_path, is_company_stamp",
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <Link
        href="/pc/invoices"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← 請求書一覧へ戻る
      </Link>

      <h1 className="text-xl font-extrabold text-navy mb-1">請求書を新規作成</h1>
      <p className="text-[12px] text-ink-2 mb-5">
        見積から自動変換した請求書も、ここから作成した請求書も同じ画面で管理できます。
      </p>

      <InvoiceForm
        customers={customers ?? []}
        projects={projects ?? []}
        stamps={stamps ?? []}
        action={createInvoice}
        submitLabel="作成する"
      />
    </div>
  );
}
