import { requireSession } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { CostManagementClient } from "./CostManagementClient";
import { MOCK_PROJECTS } from "../projects/_data/mock-projects";

export const dynamic = "force-dynamic";

/**
 * 原価管理画面(PC desktop 版)。
 *
 * 参照画像「原価管理.png」準拠の構成:
 *  - 上段 KPI 4 cards: 売上累計 / 利益率(donut)/ 原価合計 / 利益額
 *  - 中央上段: 売上・原価・利益 月次 chart(SVG bar chart、3 系列)
 *  - 中央下段: 案件別 売上・原価・利益 table
 *  - 右サイドバー: 利益率 Top 5 ランキング + 派生統計
 *
 * 売上情報は経営層限定 (office/ceo/system) でアクセス。
 *
 * TODO(P12-08-data): 実 Supabase の cost_items / projects テーブル連携、
 * Server Action での原価入力。
 * TODO(P12-08-decimal): 金額計算を decimal.js に置換。
 * TODO(P12-08-chart): Recharts 等の chart ライブラリ採用検討
 *   (現状は SVG 直書きで十分視認性確保)。
 */
export default async function CostPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }

  return <CostManagementClient projects={MOCK_PROJECTS} />;
}
