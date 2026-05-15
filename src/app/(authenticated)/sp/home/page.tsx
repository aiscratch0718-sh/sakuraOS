import { requireSession } from "@/server/auth/session";
import { SpHomeClient } from "./SpHomeClient";
import { MOCK_PROJECTS } from "../../pc/projects/_data/mock-projects";

export const dynamic = "force-dynamic";

/**
 * SP モバイル版ホーム画面(作業員・現場リーダー向け)。
 *
 * 参照画像「モバイル版.png」準拠の縦長一画面ハブ:
 *  - 挨拶ヘッダー
 *  - 本日の現場 card(進捗 + メタ)
 *  - 大型 3 ボタン(出勤 / 退勤 / REPORT3 入力、タッチ最適化 44×44+)
 *  - 今日のタスク(チェックリスト)
 *  - REPORT3 クイック入力
 *  - 本日の進捗統計
 *  - ゲーミフィケーション(XP / バッジ)
 *  - チームクエスト
 *  - お知らせ
 *
 * BottomNav は親 layout.tsx が描画(ホーム/REPORT3/案件/通知/プロフ)。
 *
 * TODO(P12-11-data): Supabase の attendance / report3_entries / gamification_events
 * テーブル連携、GPS 打刻、カメラスキャン、PWA install 検知。
 */
export default async function SpHomePage() {
  const session = await requireSession();
  const todayProject =
    MOCK_PROJECTS.find((p) => p.status === "active") ?? MOCK_PROJECTS[0];

  return (
    <SpHomeClient
      userName={session.displayName ?? "山田 太郎"}
      project={todayProject ?? null}
    />
  );
}
