import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { updateInvoice } from "@/features/billing/actions/invoice";
import { InvoiceForm } from "../InvoiceForm";
import { MarkPaidButton } from "./MarkPaidButton";
import type {
  BillingActionResult,
  ItemInput,
} from "@/features/billing/schemas";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/invoices");
  }

  const supabase = await createClient();
  const [
    { data: invoice },
    { data: items },
    { data: customers },
    { data: projects },
    { data: stamps },
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select(
        "id, customer_id, project_id, estimate_id, invoice_no, title, status, issue_date, due_date, tax_rate, note, stamps, print_company_stamp, print_staff_info, print_company_contact",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("invoice_items")
      .select("name, description, quantity, unit, unit_price_cents")
      .eq("invoice_id", id)
      .order("display_order", { ascending: true }),
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

  if (!invoice) {
    notFound();
  }

  const initialItems: ItemInput[] = (items ?? []).map((it) => ({
    name: it.name,
    description: it.description ?? "",
    quantity: Number(it.quantity),
    unit: it.unit ?? "",
    unitPriceYen: Math.round(Number(it.unit_price_cents) / 100),
  }));

  const action = async (
    prev: BillingActionResult,
    formData: FormData,
  ): Promise<BillingActionResult> => {
    "use server";
    return updateInvoice(id, prev, formData);
  };

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <Link
        href="/pc/invoices"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← 請求書一覧へ戻る
      </Link>

      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy mb-1">
            請求書を編集 — {invoice.title}
          </h1>
          <p className="text-[12px] text-ink-2">
            入金が確認できたら「入金確認」ボタンで「支払済」に変更してください。
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/invoices/${id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary py-2 px-4 text-[12px]"
          >
            📄 PDF
          </a>
          <a
            href={`/api/invoices/${id}/excel`}
            className="btn-ghost py-2 px-4 text-[12px]"
          >
            📊 Excel
          </a>
          <MarkPaidButton invoiceId={id} currentStatus={invoice.status} />
        </div>
      </div>

      <InvoiceForm
        initial={{ ...invoice, items: initialItems }}
        customers={customers ?? []}
        projects={projects ?? []}
        stamps={stamps ?? []}
        action={action}
        submitLabel="更新する"
      />
    </div>
  );
}
