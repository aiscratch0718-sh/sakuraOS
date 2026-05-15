import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { EstimateBuilderClient } from "./EstimateBuilderClient";
import { MOCK_PROJECTS } from "../../projects/_data/mock-projects";

export const dynamic = "force-dynamic";

/**
 * 見積書作成画面(PC desktop 版)。
 *
 * 参照画像「見積書.png」準拠の 2-pane layout:
 *  - 上段: タブ(基本情報/明細/プレビュー/承認フロー)+ KPI 4 cards
 *  - 左 panel: 顧客情報フォーム + 見積明細 table + 合計
 *  - 右 panel: 御見積書プレビュー(リアルタイム反映)
 *  - 下端アクションバー: 保存 / PDF / クラウドサイン送信 / 承認申請 等
 *
 * 案件管理 / 通知 / 配置マップ / スケジュール と同じ Server + Client パターン継承。
 * mock データは pc/projects/_data/mock-projects.ts から DRY 再利用。
 *
 * 保持: 既存 EstimateForm.tsx(304 行、Supabase 連携、将来本実装時に使用)
 *
 * TODO(P12-06-data): 実 Supabase の customers / projects / estimates テーブル連携、
 * Server Action での見積作成 + 承認ワークフロー連動、PDF 出力(react-pdf 等)、
 * クラウドサイン API 連携。
 * TODO(P12-06-decimal): 金額計算を decimal.js に置換(現状は Number で十分なデモ用)。
 */
export default async function NewEstimatePage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/estimates");
  }

  return <EstimateBuilderClient projects={MOCK_PROJECTS} />;
}
