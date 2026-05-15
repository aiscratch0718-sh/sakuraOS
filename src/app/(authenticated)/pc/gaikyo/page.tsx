import { requireSession } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { GaikyoClient } from "./GaikyoClient";
import { MOCK_PROJECTS } from "../projects/_data/mock-projects";

export const dynamic = "force-dynamic";

/**
 * 工事概況表(GAIKYO)— SAKURA OS 設計図の核画面。
 *
 * 参照画像「工事概況表」(2026-05-16 共有)準拠:
 *  - 上段 KPI 4 cards: 売上累計 / 原価累計 / 利益額 / 利益率(donut)
 *  - 中央 9 col: 月別 bar chart + 案件別 table + ページネーション
 *  - 右 3 col: 選択中案件詳細(利益 / 工期 / 案件情報 / 印刷)
 *
 * MASTER-PLAN P6-04 の mock-driven デモ版。
 * 本実装 P6-04-data では Supabase の construction_overview テーブルから
 * 集計データを取得し、recalculate_construction_overview() RPC で再計算。
 *
 * ロール gate: office / ceo / system のみアクセス可(売上情報は経営層限定)。
 */
export default async function GaikyoPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }

  return <GaikyoClient projects={MOCK_PROJECTS} />;
}
