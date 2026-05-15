import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { GamificationClient } from "./GamificationClient";

export const dynamic = "force-dynamic";

/**
 * クエスト・バッジ フルページ版(PC desktop)。
 *
 * 参照画像「クエストバッチ.png」準拠:
 *  - 上段 KPI 4 cards(レベル / 累計 XP / クエスト達成率 / 獲得バッジ)
 *  - タブ 3 枚: 進行中クエスト / チームクエスト / バッジ一覧
 *  - 中央 9 col: featured quest + クエスト/バッジリスト
 *  - 右 3 col: ユーザー情報 + 最近獲得 + おすすめアクション + 今後の予定
 *
 * ロール gate: leader / office / ceo / system のみアクセス可。
 *
 * TODO(P12-09-data): Supabase の gamification_events / user_badges / badges /
 * quests テーブル連携、リアル XP 計算ロジックの統合(現状は mock データで
 * 参照画像準拠の demo を優先)。
 */
export default async function PcGamificationPage() {
  const session = await requireSession();
  if (!["leader", "office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }

  return <GamificationClient userName={session.displayName ?? "山田 太郎"} />;
}
