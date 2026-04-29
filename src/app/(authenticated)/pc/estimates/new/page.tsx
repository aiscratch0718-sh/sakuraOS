import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createEstimate } from "@/features/billing/actions/estimate";
import { EstimateForm } from "../EstimateForm";

export const dynamic = "force-dynamic";

export default async function NewEstimatePage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/estimates");
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
        .eq("status", "active")
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
        href="/pc/estimates"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← 見積一覧へ戻る
      </Link>

      <h1 className="text-xl font-extrabold text-navy mb-1">見積を新規作成</h1>
      <p className="text-[12px] text-ink-2 mb-5">
        明細を入力すると小計・消費税・合計が自動計算されます。
      </p>

      <EstimateForm
        customers={customers ?? []}
        projects={projects ?? []}
        stamps={stamps ?? []}
        action={createEstimate}
        submitLabel="作成する"
      />
    </div>
  );
}
