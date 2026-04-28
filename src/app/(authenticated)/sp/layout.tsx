import { requireSession } from "@/server/auth/session";
import { BottomNav } from "./_components/BottomNav";

export default async function SpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="pb-20">
      {children}
      <BottomNav role={session.role} />
    </div>
  );
}
