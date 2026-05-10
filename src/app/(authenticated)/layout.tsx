import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

/**
 * 認証済みレイアウト。
 *
 * 参照画像準拠(2026-05-11):
 * - PC 画面ではグローバルヘッダーを描画しない(サイドバーで全機能完結)
 * - サインアウト・外観設定は SidebarFooterWidget のメニュー内 / SettingsPage に集約
 * - モバイル(/sp/*)は別途モバイル用ヘッダーを各画面で実装
 *
 * テナントブランディング(logoUrl / primary_color 等)は将来 CSS 変数で適用するが、
 * REPORT3 ロゴをサイドバーに固定したため当面は使用しない。
 */
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  void session; // セッション認証は requireSession 内で実施(未認証なら redirect)

  // テナントブランディングは将来再導入予定(現状は REPORT3 固定)
  const supabase = await createClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("primary_color, accent_color, bg_color")
    .eq("id", session.tenantId)
    .maybeSingle();

  const primary = tenant?.primary_color ?? "#1a3a6a";
  const accent = tenant?.accent_color ?? "#2568c8";
  const bg = tenant?.bg_color ?? "#f6f9fc";

  const themeStyle: React.CSSProperties & Record<string, string> = {
    "--brand-primary": primary,
    "--brand-accent": accent,
    "--brand-bg": bg,
    background: bg,
  };

  return (
    <div className="min-h-screen" style={themeStyle}>
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
