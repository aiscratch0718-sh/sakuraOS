import { requireSession } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { ComingSoonPage } from "../_components/ComingSoonPage";

export const dynamic = "force-dynamic";

export default async function CostPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }
  return (
    <ComingSoonPage
      title="原価管理"
      description="現場別 原価・売上・利益の月次集計を表示します。"
      phaseId="P12-05"
      estimatedDate="2026年6月中旬"
    />
  );
}
