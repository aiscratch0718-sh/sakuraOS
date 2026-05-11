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
      return "管理者";
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

  const sb = await createClient();
  const { data: tenant } = await sb
    .from("tenants")
    .select("name, logo_url")
    .eq("id", session.tenantId)
    .maybeSingle();

  return (
    <div className="pc-dashboard-dpi-fit flex min-h-screen bg-slate-50">
      <Sidebar
        role={session.role}
        displayName={session.displayName}
        roleLabel={roleLabel(session.role)}
        tenantName={tenant?.name ?? "REPORT3"}
        tagline="業務管理システム"
        logoUrl={tenant?.logo_url ?? null}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
