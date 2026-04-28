import { requireSession } from "@/server/auth/session";
import { Sidebar } from "./_components/Sidebar";

export default async function PcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex">
      <Sidebar role={session.role} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
