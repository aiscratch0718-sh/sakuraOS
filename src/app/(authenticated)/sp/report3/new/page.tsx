import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Report3Form } from "./Report3Form";

export const dynamic = "force-dynamic";

export default async function Report3NewPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("status", "active")
    .order("name", { ascending: true });

  const { data: classifications } = await supabase
    .from("work_classifications")
    .select("l1, l2, l3, display_order")
    .eq("is_active", true)
    .order("l1")
    .order("l2")
    .order("display_order");

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <Link
        href="/sp/home"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← ホームへ戻る
      </Link>

      <h1 className="text-lg font-extrabold text-navy mb-4">作業日報を書く</h1>

      <Report3Form
        projects={projects ?? []}
        classifications={classifications ?? []}
        tenantId={session.tenantId}
      />
    </div>
  );
}
