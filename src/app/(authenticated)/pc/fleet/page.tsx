import { requireSession } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { ComingSoonPage } from "../_components/ComingSoonPage";

export const dynamic = "force-dynamic";

export default async function FleetPage() {
  const session = await requireSession();
  if (!["leader", "office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }
  return (
    <ComingSoonPage
      title="車両・工具"
      description="車両管理・工程確認・災害対策・通信記録を統合した画面です。既存の /pc/vehicles および /pc/tools から移行予定。"
      phaseId="P12-10"
      estimatedDate="2026年7月"
      backHref="/pc/vehicles"
    />
  );
}
