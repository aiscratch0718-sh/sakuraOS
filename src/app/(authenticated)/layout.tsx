import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const initial = session.displayName.slice(0, 1);

  // テナントブランディング(ロゴ + カラーテーマ)
  const supabase = await createClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("logo_url, primary_color, accent_color, bg_color, sidebar_color")
    .eq("id", session.tenantId)
    .maybeSingle();

  const primary = tenant?.primary_color ?? "#1a3a6a";
  const accent = tenant?.accent_color ?? "#2568c8";
  const bg = tenant?.bg_color ?? "#e8f0f8";
  const sidebar = tenant?.sidebar_color ?? "#ffffff";
  const logoUrl = tenant?.logo_url ?? null;

  const themeStyle: React.CSSProperties & Record<string, string> = {
    "--brand-primary": primary,
    "--brand-accent": accent,
    "--brand-bg": bg,
    "--brand-sidebar": sidebar,
    background: bg,
  };

  return (
    <div className="min-h-screen flex flex-col" style={themeStyle}>
      <header
        className="text-white px-5 py-3 flex items-center gap-4 shadow-head sticky top-0 z-40"
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, ${shade(primary, 18)} 100%)`,
        }}
      >
        {/* モバイル時のみロゴ表示。デスクトップではサイドバーがロゴを担当 */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity md:hidden"
        >
          {logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logoUrl} alt="ロゴ" className="h-7 max-w-[160px] object-contain" />
          ) : (
            <>
              <span
                className="w-[18px] h-[18px] bg-brand-yellow rotate-45 rounded-[3px]"
                aria-hidden
              />
              <span className="font-extrabold text-[15px] tracking-wider">SAKURA OS</span>
            </>
          )}
        </Link>

        <span className="text-[12px] opacity-80 hidden md:inline">
          {roleLabel(session.role)}ホーム
        </span>

        <div className="flex-1" />

        <div className="flex items-center gap-2 text-[12px]">
          <span className="hidden sm:inline">{session.displayName}</span>
          <div
            className="w-[30px] h-[30px] rounded-full bg-amber-2 flex items-center justify-center font-bold text-[12px] text-white"
            aria-hidden
          >
            {initial}
          </div>
        </div>

        {["office", "ceo", "system"].includes(session.role) && (
          <Link
            href="/pc/settings/branding"
            className="bg-white/15 border border-white/30 text-white px-3 py-1 rounded-btn text-[11px] font-medium hover:bg-white/25 transition-colors hidden md:inline-block"
            title="外観設定"
          >
            🎨 外観
          </Link>
        )}

        <form action="/sign-out" method="POST">
          <button
            type="submit"
            className="bg-white/15 border border-white/30 text-white px-3 py-1 rounded-btn text-[11px] font-medium hover:bg-white/25 transition-colors"
          >
            サインアウト
          </button>
        </form>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}

/**
 * 色を percent だけ明るく(正値)/ 暗く(負値)するユーティリティ。
 */
function shade(hex: string, percent: number): string {
  const m = hex.match(/^#([0-9a-fA-F]{6})$/);
  if (!m) return hex;
  const num = parseInt(m[1]!, 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function roleLabel(role: string): string {
  switch (role) {
    case "worker":
      return "作業員";
    case "leader":
      return "現場リーダー";
    case "office":
      return "事務";
    case "ceo":
      return "経営層";
    case "system":
      return "システム";
    default:
      return role;
  }
}
