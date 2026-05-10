import { requireSession } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { ComingSoonPage } from "../_components/ComingSoonPage";

export const dynamic = "force-dynamic";

export default async function GaikyoPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }
  return (
    <ComingSoonPage
      title="工事概況表"
      description="全社の売上・原価・利益・進捗を一覧で確認します。"
      phaseId="P12-05 / P6"
      estimatedDate="2026年6月中旬"
    />
  );
}
