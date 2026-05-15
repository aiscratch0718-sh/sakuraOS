import { requireSession } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { FleetClient } from "./FleetClient";

export const dynamic = "force-dynamic";

/**
 * 車両・工具統合管理画面(PC desktop)。
 *
 * 参照画像「車両工具.png」準拠の 2-pane layout:
 *  - 上段 KPI 4 cards: 稼働中 / 整備中 / 工具 / 警告件数
 *  - タブ 3 枚: 車両管理 / 工程確認 / 災害履歴
 *  - 左 panel: 車両 / 工具 list table
 *  - 右 panel: 選択中の詳細(画像 + 案件 + 工程 + 整備 + GPS ミニマップ + 警告)
 *
 * ロール gate: leader / office / ceo / system のみアクセス可。
 *
 * TODO(P12-10-data): Supabase の vehicles / tools / maintenance_logs テーブル
 * 連携、GPS リアルタイム位置情報(vehicle_gps_events)、QR コードスキャン履歴。
 */
export default async function FleetPage() {
  const session = await requireSession();
  if (!["leader", "office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }
  return <FleetClient />;
}
