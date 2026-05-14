import { requireSession } from "@/server/auth/session";
import { SchedulesClient } from "./SchedulesClient";
import { MOCK_PROJECTS } from "../projects/_data/mock-projects";

export const dynamic = "force-dynamic";

/**
 * スケジュール画面(PC desktop 版)。
 *
 * 参照画像「スケジュール.png」準拠の 3-pane layout:
 *  - 左 panel: フィルター(チーム/工種/状態)+ チームコスト推移 mini chart
 *  - 中央 panel: 案件 × 週ビュー(7日、案件行に配置 chip)
 *  - 右 panel: 本日のスケジュール + 未配置者リスト + 印刷ボタン
 *
 * 案件管理 / 通知 / 配置マップ と同じ Server + Client パターン継承。
 * mock データは pc/projects/_data/mock-projects.ts から DRY 再利用。
 *
 * TODO(P12-05-data): 実 Supabase の assignments テーブルから日別配置取得。
 * 現状は MOCK_PROJECTS の crew / leader から擬似配置生成。
 */
export default async function SchedulesPage() {
  await requireSession();

  return <SchedulesClient projects={MOCK_PROJECTS} />;
}
