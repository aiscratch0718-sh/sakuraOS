import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { InvoiceBuilderClient } from "./InvoiceBuilderClient";
import { MOCK_PROJECTS } from "../../projects/_data/mock-projects";

export const dynamic = "force-dynamic";

/**
 * 請求書発行画面(PC desktop 版)。
 *
 * 参照画像「請求書.png」準拠の 2-pane + 入金管理 layout:
 *  - 上段: タブ(請求情報/明細入力/プレビュー/入金管理)+ KPI 4 cards
 *  - 左 panel: 請求書情報フォーム + 明細入力 table + 合計
 *  - 右 panel: 請求書プレビュー + 入金タイムライン + 入金アクション
 *  - 下段: 入金ステータスバー(請求額 / 入金額 / 残高 + 5 段進行)
 *
 * 見積書(P12-06)と並行構造。MOCK_PROJECTS から DRY 再利用。
 * 保持: 既存 InvoiceForm.tsx(308 行、Supabase 連携、将来本実装時に活用)
 *
 * TODO(P12-07-data): Supabase の invoices / payments テーブル連携、
 * Server Action での請求書作成 + 入金登録、PDF 出力、メール送信。
 * TODO(P12-07-decimal): 金額計算を decimal.js に置換(現状は Number で十分なデモ)。
 */
export default async function NewInvoicePage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/invoices");
  }

  return <InvoiceBuilderClient projects={MOCK_PROJECTS} />;
}
