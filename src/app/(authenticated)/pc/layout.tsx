import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./_components/Sidebar";

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

export default async function PcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  // テナント名 + ロゴをサイドバー表示用に取得
  const sb = await createClient();
  const { data: tenant } = await sb
    .from("tenants")
    .select("name, logo_url")
    .eq("id", session.tenantId)
    .maybeSingle();

  return (
    <div className="flex">
      <Sidebar
        role={session.role}
        displayName={session.displayName}
        roleLabel={roleLabel(session.role)}
        tenantName={tenant?.name ?? "SAKURA OS"}
        tagline="建設業務管理"
        logoUrl={tenant?.logo_url ?? null}
      />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
