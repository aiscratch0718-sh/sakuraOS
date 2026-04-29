import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { IncidentForm } from "./IncidentForm";

export const dynamic = "force-dynamic";

export default async function NewIncidentPage() {
  await requireSession();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("status", "active")
    .order("name", { ascending: true });

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <Link
        href="/sp/incidents"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← 一覧へ戻る
      </Link>

      <h1 className="text-lg font-extrabold text-navy mb-1">
        ヒヤリハット報告
      </h1>
      <p className="text-[11px] text-ink-3 mb-4">
        起きそうになったこと、危なかったことを共有してください。原因と対策まで埋めると更に効果的です。
      </p>

      <IncidentForm projects={projects ?? []} />
    </div>
  );
}
