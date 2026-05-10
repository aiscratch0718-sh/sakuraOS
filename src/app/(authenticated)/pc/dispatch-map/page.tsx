import { requireSession } from "@/server/auth/session";
import { ComingSoonPage } from "../_components/ComingSoonPage";

export const dynamic = "force-dynamic";

export default async function DispatchMapPage() {
  await requireSession();
  return (
    <ComingSoonPage
      title="配置マップ"
      description="Google Maps 上で現場・車両・人員配置を可視化します。"
      phaseId="P12-04"
      estimatedDate="2026年7月"
    />
  );
}
