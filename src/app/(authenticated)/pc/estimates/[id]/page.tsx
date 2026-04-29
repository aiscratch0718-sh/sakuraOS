import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { updateEstimate } from "@/features/billing/actions/estimate";
import { EstimateForm } from "../EstimateForm";
import { ConvertToInvoiceButton } from "./ConvertToInvoiceButton";
import type {
  BillingActionResult,
  ItemInput,
} from "@/features/billing/schemas";

export const dynamic = "force-dynamic";

export default async function EditEstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/estimates");
  }

  const supabase = await createClient();
  const [
    { data: estimate },
    { data: items },
    { data: customers },
    { data: projects },
    { data: stamps },
  ] = await Promise.all([
    supabase
      .from("estimates")
      .select(
        "id, customer_id, project_id, estimate_no, title, status, issue_date, expiry_date, tax_rate, note, stamps, print_company_stamp, print_staff_info, print_company_contact",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("estimate_items")
      .select(
        "name, description, quantity, unit, unit_price_cents",
      )
      .eq("estimate_id", id)
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

  if (!estimate) {
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
    return updateEstimate(id, prev, formData);
  };

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      <Link
        href="/pc/estimates"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← 見積一覧へ戻る
      </Link>

      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy mb-1">
            見積を編集 — {estimate.title}
          </h1>
          <p className="text-[12px] text-ink-2">
            状態を「送付済」「受注」などに進めて管理してください。
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/estimates/${id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary py-2 px-4 text-[12px]"
          >
            📄 PDF
          </a>
          <a
            href={`/api/estimates/${id}/excel`}
            className="btn-ghost py-2 px-4 text-[12px]"
          >
            📊 Excel
          </a>
          <ConvertToInvoiceButton estimateId={id} />
        </div>
      </div>

      <EstimateForm
        initial={{ ...estimate, items: initialItems }}
        customers={customers ?? []}
        projects={projects ?? []}
        stamps={stamps ?? []}
        action={action}
        submitLabel="更新する"
      />
    </div>
  );
}
