import { signIn, quickSignIn } from "./actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = errorToMessage(params.error);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 bg-bg">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span
            className="w-7 h-7 bg-brand-yellow rotate-45 rounded shadow"
            aria-hidden
          />
          <span className="font-extrabold text-2xl tracking-wider text-navy">
            SAKURA OS
          </span>
        </div>

        {/* テスト用クイックログイン */}
        <div className="panel-pad shadow-card mb-4 bg-amber-bg/30 border-amber/30">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-amber text-[14px]" aria-hidden>
              🚀
            </span>
            <h2 className="text-[12px] font-extrabold text-amber tracking-wider">
              テスト用クイックログイン
            </h2>
          </div>
          <p className="text-[11px] text-ink-2 mb-3">
            ロールを 1 クリック選ぶだけで即ログインできます(開発・デモ用)。
          </p>
          <form action={quickSignIn} className="space-y-2">
            <QuickButton role="system" emoji="🔧" label="開発者(全画面アクセス)" highlight />
            <div className="grid grid-cols-2 gap-2">
              <QuickButton role="ceo" emoji="👔" label="経営層" />
              <QuickButton role="office" emoji="📊" label="事務" />
              <QuickButton role="leader" emoji="🛡️" label="現場リーダー" />
              <QuickButton role="worker" emoji="👷" label="作業員" />
            </div>
          </form>
        </div>

        <details className="panel-pad shadow-card">
          <summary className="cursor-pointer text-[12px] font-bold text-ink-2 select-none">
            メールアドレスでサインイン(本番運用想定)
          </summary>

          {errorMessage && (
            <div
              role="alert"
              className="mt-3 px-3 py-2.5 rounded-btn bg-red-bg border border-red/30 text-red text-[12px] font-medium"
            >
              {errorMessage}
            </div>
          )}

          <form action={signIn} className="space-y-3 mt-3">
            <div>
              <label
                htmlFor="email"
                className="block text-[12px] font-bold text-ink-2 mb-1"
              >
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                className="input"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[12px] font-bold text-ink-2 mb-1"
              >
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="input"
              />
            </div>

            <button type="submit" className="btn-primary w-full mt-2 py-3">
              サインイン
            </button>
          </form>
        </details>

        <p className="mt-5 text-[11px] text-ink-3 text-center">
          テスト全アカウントのパスワード:{" "}
          <code className="font-mono bg-graybg px-1.5 py-0.5 rounded">
            Sakura2026!
          </code>
        </p>
      </div>
    </main>
  );
}

function QuickButton({
  role,
  emoji,
  label,
  highlight,
}: {
  role: string;
  emoji: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <button
      type="submit"
      name="role"
      value={role}
      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-btn border-2 text-[12px] font-bold transition-colors ${
        highlight
          ? "border-purple bg-purple-bg text-purple hover:bg-purple/10"
          : "border-line bg-white text-ink-2 hover:border-blue hover:bg-blue-bg/30"
      }`}
    >
      <span className="text-[16px]" aria-hidden>
        {emoji}
      </span>
      <span className="flex-1 text-left">{label}</span>
      <span className="text-[10px] opacity-60">→</span>
    </button>
  );
}

function errorToMessage(code: string | undefined): string | null {
  switch (code) {
    case "invalid_credentials":
      return "メールアドレスまたはパスワードが正しくありません。";
    case "profile_missing":
      return "ユーザープロフィールが未登録です。事務にお問い合わせください。";
    case "unknown":
      return "サインインに失敗しました。しばらくしてから再度お試しください。";
    default:
      return null;
  }
}
