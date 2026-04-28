import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { updateCustomer } from "@/features/master/actions/customer";
import { CustomerForm } from "../CustomerForm";
import type { CustomerActionResult } from "@/features/master/schemas";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/customers");
  }

  const supabase = await createClient();
  const { data: customer } = await supabase
    .from("customers")
    .select(
      "id, name, contact_person, phone, email, address, note, is_active",
    )
    .eq("id", id)
    .maybeSingle();

  if (!customer) {
    notFound();
  }

  // バインドして action のシグネチャを揃える
  const action = async (
    prev: CustomerActionResult,
    formData: FormData,
  ): Promise<CustomerActionResult> => {
    "use server";
    return updateCustomer(id, prev, formData);
  };

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto">
      <Link
        href="/pc/customers"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← 客先一覧へ戻る
      </Link>

      <h1 className="text-xl font-extrabold text-navy mb-1">
        客先を編集 — {customer.name}
      </h1>
      <p className="text-[12px] text-ink-2 mb-5">
        変更は保存と同時に反映されます。
      </p>

      <CustomerForm
        initial={customer}
        action={action}
        submitLabel="更新する"
      />
    </div>
  );
}
