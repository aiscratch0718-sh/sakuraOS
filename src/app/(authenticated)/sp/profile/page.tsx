import { requireSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  worker: "作業員",
  leader: "現場リーダー",
  office: "事務",
  ceo: "経営層",
  system: "システム管理者",
};

export default async function SpProfilePage() {
  const session = await requireSession();
  const initial = session.displayName.slice(0, 1);

  return (
    <div className="px-4 py-5 max-w-md mx-auto">
      <h1 className="text-lg font-extrabold text-navy mb-4">プロフィール</h1>

      <div className="panel-pad mb-3">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-full bg-amber-2 flex items-center justify-center font-extrabold text-white text-[22px]"
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold truncate">
              {session.displayName}
            </div>
            <div className="text-[11px] text-ink-2 truncate">
              {session.email}
            </div>
          </div>
        </div>

        <dl className="space-y-2 text-[13px]">
          <div className="flex">
            <dt className="w-24 text-ink-3 text-[11px] font-bold">ロール</dt>
            <dd className="font-bold">
              {ROLE_LABEL[session.role] ?? session.role}
            </dd>
          </div>
          <div className="flex">
            <dt className="w-24 text-ink-3 text-[11px] font-bold">テナント</dt>
            <dd className="text-ink-2 text-[11px] font-mono break-all">
              {session.tenantId.slice(0, 8)}...
            </dd>
          </div>
        </dl>
      </div>

      <form action="/sign-out" method="POST">
        <button
          type="submit"
          className="btn-ghost w-full py-2.5 text-[13px] font-bold"
        >
          サインアウト
        </button>
      </form>

      <p className="mt-6 text-[10px] text-ink-3 text-center">
        SAKURA OS — Phase B(MVP骨格)
      </p>
    </div>
  );
}
