import { requireSession } from "@/server/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * クエスト・バッジ画面(参照画像準拠の統合ページは P12-09 で実装予定)。
 * 現状は既存の /pc/points にリダイレクト(ポイント管理画面を暫定流用)。
 */
export default async function QuestsBadgesPage() {
  await requireSession();
  redirect("/pc/points");
}
