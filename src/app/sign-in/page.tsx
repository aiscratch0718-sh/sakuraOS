import { signIn } from "./actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = errorToMessage(params.error);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span
            className="w-7 h-7 bg-brand-yellow rotate-45 rounded shadow"
            aria-hidden
          />
          <span className="font-extrabold text-2xl tracking-wider text-navy">
            SAKURA OS
          </span>
        </div>

        <div className="panel-pad shadow-card">
          <h1 className="text-base font-bold text-navy mb-1">サインイン</h1>
          <p className="text-[12px] text-ink-2 mb-5">
            さくら株式会社 業務管理システム
          </p>

          {errorMessage && (
            <div
              role="alert"
              className="mb-4 px-3 py-2.5 rounded-btn bg-red-bg border border-red/30 text-red text-[12px] font-medium"
            >
              {errorMessage}
            </div>
          )}

          <form action={signIn} className="space-y-3">
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
        </div>

        <p className="mt-5 text-[11px] text-ink-3 text-center">
          アカウントは管理者が発行します。お問合せは事務までご連絡ください。
        </p>
      </div>
    </main>
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
