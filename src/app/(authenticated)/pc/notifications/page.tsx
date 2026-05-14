import { requireSession } from "@/server/auth/session";
import { NotificationsClient } from "./NotificationsClient";
import { MOCK_NOTIFICATIONS } from "./_data/mock-notifications";

export const dynamic = "force-dynamic";

/**
 * 通知画面(PC desktop 版)。
 *
 * 参照画像「通知.png」準拠の 2-pane layout:
 *  - 上部 KPI 4 cards(未読 / 緊急 / 要対応 / 既読)
 *  - Filter bar(検索 + カテゴリ tabs + 並び替え)
 *  - 左 list(各通知:アイコン + タイトル + 詳細 + 経過時間 + 優先度 pill)
 *  - 右 detail panel(選択通知の本文 + 関連 + クイックアクション)
 *
 * ダッシュボードヘッダー 🔔12 とサイドバー badge「通知 12」と連動:
 *  - 未読件数 12 が一致するように mock を設計済
 *
 * TODO(P12-03-data): 実 DB から notifications を取得
 * (現状は配管業向け 18 件 mock データ)。
 */
export default async function PcNotificationsPage() {
  await requireSession();

  // 現状は mock データを直接渡す。将来 Supabase fetch に置換。
  return <NotificationsClient notifications={MOCK_NOTIFICATIONS} />;
}
