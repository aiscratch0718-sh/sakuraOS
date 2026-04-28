import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createCustomer } from "@/features/master/actions/customer";
import { CustomerForm } from "../CustomerForm";

export const dynamic = "force-dynamic";

export default async function NewCustomerPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/customers");
  }

  return (
    <div className="px-6 py-6 max-w-2xl mx-auto">
      <Link
        href="/pc/customers"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← 客先一覧へ戻る
      </Link>

      <h1 className="text-xl font-extrabold text-navy mb-1">客先を新規登録</h1>
      <p className="text-[12px] text-ink-2 mb-5">
        登録した客先は、現場登録時の選択肢に表示されます。
      </p>

      <CustomerForm action={createCustomer} submitLabel="登録する" />
    </div>
  );
}
