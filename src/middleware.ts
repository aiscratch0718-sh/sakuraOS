import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

/**
 * Middleware: refreshes the Supabase auth cookie on every request.
 * Required by @supabase/ssr to keep sessions alive across server-rendered pages.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — IMPORTANT: do not run any other logic between this call
  // and the response.
  await supabase.auth.getUser();

  return response;
}

/**
 * Performance: middleware は毎リクエストで Supabase Auth API に往復するため、
 * matcher を最小化して認証必須のルートだけに絞る。
 *
 * - 認証必須: `/`, `/pc/*`, `/sp/*`(全部 Server Component で requireSession を呼ぶ)
 * - 認証スキップ: `/sign-in`, `/sign-out`, `/_next/*`, 静的ファイル, 画像, robots, favicon
 *
 * これで:
 * - サインイン画面の表示が速い(無駄な Auth 往復なし)
 * - CSS/JS/フォント などの静的アセットがリフレッシュ処理を経由しない
 * - 認証画面の体感が顕著に改善する
 */
export const config = {
  matcher: ["/", "/pc/:path*", "/sp/:path*"],
};
