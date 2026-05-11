import { requireSession } from "@/server/auth/session";
import { Report3InputForm } from "./Report3InputForm";

export const dynamic = "force-dynamic";

/**
 * REPORT3 入力(PC desktop 版)。
 *
 * 参照画像「REPORT3入力」準拠の 5 ステップ Wizard 形式:
 *  1. 現場選択 / 2. 作業内容 / 3. 時間入力 / 4. 写真添付 / 5. 確認
 *
 * 1 回の送信で 日報 / 原価 / 工事概況 / XP に atomic に反映される
 * (ADR-0001 REPORT3 atomic fanout)。
 *
 * モバイル版(/sp/report3/new)とは別の UI:
 *  - PC 版は wide layout、右側に本日の配属現場 + Tips
 *  - モバイル版は縦スクロール、片手操作前提
 */
export default async function PcReport3NewPage() {
  await requireSession();

  // TODO(P11-08): projects / work_classifications を Supabase から取得
  // 現状は配管業向け mock データで demo
  return <Report3InputForm />;
}
