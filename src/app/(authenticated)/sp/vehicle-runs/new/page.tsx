import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { VehicleRunForm } from "./VehicleRunForm";

export const dynamic = "force-dynamic";

export default async function NewVehicleRunPage() {
  await requireSession();
  const supabase = await createClient();

  const [{ data: vehicles }, { data: projects }] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, plate_number, model")
      .eq("is_active", true)
      .neq("status", "retired")
      .order("plate_number", { ascending: true }),
    supabase
      .from("projects")
      .select("id, name")
      .eq("status", "active")
      .order("name", { ascending: true }),
  ]);

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <Link
        href="/sp/vehicle-runs"
        className="inline-block text-[12px] text-blue underline mb-3"
      >
        ← 運行履歴へ戻る
      </Link>

      <h1 className="text-lg font-extrabold text-navy mb-1">運行記録を作成</h1>
      <p className="text-[11px] text-ink-3 mb-4">
        運行前にアルコールチェックを実施し、結果を入力してください。
      </p>

      <VehicleRunForm
        vehicles={vehicles ?? []}
        projects={projects ?? []}
      />
    </div>
  );
}
