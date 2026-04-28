import { requireSession } from "@/server/auth/session";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const initial = session.displayName.slice(0, 1);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-br from-navy to-navy-2 text-white px-5 py-3 flex items-center gap-4 shadow-head sticky top-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span
            className="w-[18px] h-[18px] bg-brand-yellow rotate-45 rounded-[3px]"
            aria-hidden
          />
          <span className="font-extrabold text-[15px] tracking-wider">
            SAKURA OS
          </span>
        </div>

        {/* Current view label */}
        <span className="text-[12px] opacity-80 hidden sm:inline">
          / {roleLabel(session.role)}ホーム
        </span>

        <div className="flex-1" />

        {/* User chip */}
        <div className="flex items-center gap-2 text-[12px]">
          <span className="hidden sm:inline">{session.displayName}</span>
          <div
            className="w-[30px] h-[30px] rounded-full bg-amber-2 flex items-center justify-center font-bold text-[12px] text-white"
            aria-hidden
          >
            {initial}
          </div>
        </div>

        {/* Sign-out */}
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
