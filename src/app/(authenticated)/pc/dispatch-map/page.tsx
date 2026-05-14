import { requireSession } from "@/server/auth/session";
import { DispatchMapClient } from "./DispatchMapClient";
import { MOCK_PROJECTS } from "../projects/_data/mock-projects";

export const dynamic = "force-dynamic";

/**
 * 配置マップ画面(PC desktop 版)。
 *
 * 参照画像「マップ.png」準拠の 3-pane layout:
 *  - 左 panel: フィルター(検索 / 日付 / エリア / 工種 / 状態 checkbox / 絞り込むボタン)
 *  - 中央 panel: マップ表示(Google Maps iframe + 表示モード切替 + 上部検索バー)
 *  - 右 panel: 選択案件詳細(状態 pill / 金額 / 工期 / 進捗 / 配置作業員 / アクション)
 *
 * 案件管理 / 通知画面と同じ 2-pane → 3-pane に拡張。
 * mock データは pc/projects/_data/mock-projects.ts を直接再利用(DRY)。
 *
 * TODO(P12-01-map): Google Maps JavaScript API + API キー発行で
 * 自社 5 色ピン描画に切替。現状は iframe 埋込で API キー不要。
 */
export default async function DispatchMapPage() {
  await requireSession();

  return <DispatchMapClient projects={MOCK_PROJECTS} />;
}
