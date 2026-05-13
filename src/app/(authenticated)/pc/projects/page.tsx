import { requireSession } from "@/server/auth/session";
import { ProjectsListClient } from "./ProjectsListClient";
import { MOCK_PROJECTS } from "./_data/mock-projects";

export const dynamic = "force-dynamic";

/**
 * 案件管理画面(PC desktop 版)。
 *
 * 参照画像「案件管理.png」準拠の 2-pane layout:
 *  - 上部 KPI 4 cards(進行中 / 完了予定 / 遅延 / 完了済)
 *  - 中段 filter bar(検索 / ステータス / 期日 sort)
 *  - 左 list table(全 15 件、選択可能、ステータス pill)
 *  - 右 detail panel(選択案件の情報 + 進捗 + クイックアクション)
 *
 * 5 つの下流画面(見積 / 請求 / 原価 / スケジュール / 配置マップ)が
 * ここの projects データを参照する。データモデルが固まればそのまま
 * Supabase に置き換え可能。
 *
 * TODO(P12-02-data): 実 DB から projects + customers を取得
 * (現状は宮城県 5 件 + 追加 10 件 = 15 件の mock データ)。
 */
export default async function PcProjectsPage() {
  const session = await requireSession();
  const canEdit = ["office", "ceo", "system"].includes(session.role);

  // 現状は mock データを直接渡す。将来 Supabase fetch に置換。
  return <ProjectsListClient projects={MOCK_PROJECTS} canEdit={canEdit} />;
}
