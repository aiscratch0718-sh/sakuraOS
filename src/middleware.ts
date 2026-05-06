import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

/**
 * 5秒ソフトタイムアウト付き Promise.race。タイムアウト時は null を返す。
 */
async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return await Promise.race([
    p,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * Middleware: refreshes the Supabase auth cookie on every protected route.
 *
 * 設計判断:
 * - getUser() は Supabase Auth API へ往復するため、コールドスタート + ネットワーク
 *   揺らぎが重なると Vercel ミドルウェアの 25 秒上限を超え 504 になる場合がある。
 * - 認証必須判定そのものは各ページの Server Component の requireSession() が責任を
 *   持つため、ミドルウェアで getUser() が失敗 / タイムアウトしても安全にスルーできる。
 * - 5 秒のソフトタイムアウト + try/catch で堅牢性を担保する。
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  try {
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

    // Refresh session(5秒タイムアウト)
    await withTimeout(supabase.auth.getUser(), 5000);
  } catch {
    // ミドルウェアでエラーになってもページ側 requireSession() が再チェックするため
    // 安全にスルー
  }

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
