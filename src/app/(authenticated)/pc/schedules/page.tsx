import { requireSession } from "@/server/auth/session";
import { ComingSoonPage } from "../_components/ComingSoonPage";

export const dynamic = "force-dynamic";

export default async function SchedulesPage() {
  await requireSession();
  return (
    <ComingSoonPage
      title="スケジュール"
      description="週間ビュー・配車表・人員配置をドラッグ&ドロップで管理します。"
      phaseId="P12-03"
      estimatedDate="2026年6月上旬"
    />
  );
}
