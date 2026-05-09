import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ReceiptForm } from "./ReceiptForm";

export const dynamic = "force-dynamic";

export default async function NewReceiptPage() {
  const session = await requireSession();
  const sb = await createClient();
  const { data: projects } = await sb
    .from("projects")
    .select("id, name")
    .eq("status", "active")
    .order("name", { ascending: true });
  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <Link href="/sp/receipts" className="inline-block text-[12px] text-blue underline mb-3">
        ← 一覧へ戻る
      </Link>
      <h1 className="text-lg font-extrabold text-navy mb-1">領収書を提出</h1>
      <p className="text-[11px] text-ink-3 mb-4">
        会社カード支払い → 提出のみ。個人立替 → 精算申請可能。
      </p>
      <ReceiptForm projects={projects ?? []} tenantId={session.tenantId} />
    </div>
  );
}
