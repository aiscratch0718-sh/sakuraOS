import { requireSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  worker: "作業員",
  leader: "現場リーダー",
  office: "事務",
  ceo: "経営層",
  system: "システム管理者",
};

export default async function PcProfilePage() {
  const session = await requireSession();
  const initial = session.displayName.slice(0, 1);

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-extrabold text-navy mb-5">プロフィール</h1>

      <div className="panel-pad mb-4">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-16 h-16 rounded-full bg-amber-2 flex items-center justify-center font-extrabold text-white text-[26px]"
            aria-hidden
          >
            {initial}
          </div>
          <div>
            <div className="text-base font-extrabold">
              {session.displayName}
            </div>
            <div className="text-[12px] text-ink-2">{session.email}</div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-[13px]">
          <div>
            <dt className="text-[11px] text-ink-3 font-bold mb-1">ロール</dt>
            <dd className="font-bold">
              {ROLE_LABEL[session.role] ?? session.role}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-ink-3 font-bold mb-1">テナントID</dt>
            <dd className="text-ink-2 text-[11px] font-mono break-all">
              {session.tenantId}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-ink-3 font-bold mb-1">ユーザーID</dt>
            <dd className="text-ink-2 text-[11px] font-mono break-all">
              {session.userId}
            </dd>
          </div>
        </dl>
      </div>

      <form action="/sign-out" method="POST">
        <button
          type="submit"
          className="btn-ghost py-2 px-5 text-[13px] font-bold"
        >
          サインアウト
        </button>
      </form>

      <p className="mt-8 text-[11px] text-ink-3">
        ※ Phase B(MVP骨格)— ユーザー設定・パスワード変更・通知設定は Beta 以降で実装。
      </p>
    </div>
  );
}
