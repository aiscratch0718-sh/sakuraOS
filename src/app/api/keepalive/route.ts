import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Supabase keep-alive endpoint.
 *
 * Why this exists:
 *   Supabase Free プランは 7 日間データベースへのアクセスがないと
 *   プロジェクトが自動的に INACTIVE(pause)になる。
 *   本エンドポイントを Vercel Cron から週 1 回叩くことで、
 *   開発が一時停止する期間でも自動 pause を回避する。
 *
 * Trigger:
 *   `vercel.json` の crons 設定で毎週月曜 09:00 JST(00:00 UTC)に実行。
 *
 * Why no auth:
 *   このルートは tenants から id を 1 件 SELECT するだけ(副作用なし)。
 *   返却値は { ok, tenants, elapsedMs } の整数情報のみで、機密データを含まない。
 *   公開しても全体のセキュリティ水準は変わらない、と判断して認証を外した。
 *
 * Failure mode:
 *   Supabase が一時的に応答しなくても 200 を返し、cron 失敗扱いにせず
 *   次週のリトライに任せる。エラー詳細は Vercel ログで確認可能。
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[keepalive] Supabase env vars are not configured");
    return NextResponse.json(
      { ok: false, error: "Supabase env not configured" },
      { status: 200 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(10_000) }),
    },
  });

  const startedAt = Date.now();
  try {
    const { data, error } = await supabase
      .from("tenants")
      .select("id")
      .limit(1);

    const elapsedMs = Date.now() - startedAt;

    if (error) {
      console.error("[keepalive] Supabase error:", error.message, { elapsedMs });
      return NextResponse.json(
        { ok: false, error: error.message, elapsedMs },
        { status: 200 },
      );
    }

    console.log("[keepalive] OK", { tenants: data?.length ?? 0, elapsedMs });
    return NextResponse.json({
      ok: true,
      tenants: data?.length ?? 0,
      elapsedMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const elapsedMs = Date.now() - startedAt;
    const message = err instanceof Error ? err.message : String(err);
    console.error("[keepalive] Unexpected error:", message, { elapsedMs });
    return NextResponse.json(
      { ok: false, error: message, elapsedMs },
      { status: 200 },
    );
  }
}
