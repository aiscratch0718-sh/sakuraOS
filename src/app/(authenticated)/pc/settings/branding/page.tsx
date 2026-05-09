import { redirect } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { BrandingForm } from "./BrandingForm";

export const dynamic = "force-dynamic";

export default async function BrandingSettingsPage() {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    redirect("/pc/home");
  }

  const sb = await createClient();
  const { data: tenant } = await sb
    .from("tenants")
    .select("name, logo_url, primary_color, accent_color, bg_color, sidebar_color")
    .eq("id", session.tenantId)
    .maybeSingle();

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <Link href="/pc/home" className="inline-block text-[12px] text-blue underline mb-3">
        ← ダッシュボードへ戻る
      </Link>
      <h1 className="text-xl font-extrabold text-navy mb-1">外観設定(ブランディング)</h1>
      <p className="text-[12px] text-ink-2 mb-5">
        会社ロゴと画面の配色をカスタマイズします。設定はテナント全体(全社員)に反映されます。
      </p>
      <BrandingForm
        tenantId={session.tenantId}
        initial={{
          logoUrl: tenant?.logo_url ?? "",
          primaryColor: tenant?.primary_color ?? "#1a3a6a",
          accentColor: tenant?.accent_color ?? "#2568c8",
          bgColor: tenant?.bg_color ?? "#e8f0f8",
          sidebarColor: tenant?.sidebar_color ?? "#ffffff",
        }}
      />
    </div>
  );
}
