import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Supabase keep-alive endpoint.
 *
 * Why this exists:
 *   Supabase Free プランは 7 日間 API リクエストがないと
 *   プロジェクトが自動的に INACTIVE(pause)になる。
 *   本エンドポイントを Vercel Cron から週 1 回叩くことで、
 *   開発が一時停止する期間でも自動 pause を回避する。
 *
 * Trigger:
 *   `vercel.json` の crons 設定で毎週月曜 09:00 JST(00:00 UTC)に実行。
 *
 * Why anon key (not service_role):
 *   pause 防止の目的では「API リクエストが Supabase に届く」だけで十分。
 *   RLS により未認証(anon)では tenants テーブルから 0 件返ってくるが、
 *   リクエスト自体は Supabase 側で記録され、pause タイマーがリセットされる。
 *   Service Role Key を本番に置かないことで最小権限の原則を維持。
 *
 * Why no auth:
 *   このルートは副作用ゼロ(SELECT のみ)。返却値は整数情報のみで機密データを含まない。
 *
 * Failure mode:
 *   Supabase が一時的に応答しなくても 200 を返し、cron 失敗扱いにせず
 *   次週のリトライに任せる。エラー詳細は Vercel ログで確認可能。
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error("[keepalive] Supabase env vars are not configured");
    return NextResponse.json(
      { ok: false, error: "Supabase env not configured" },
      { status: 200 },
    );
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(10_000) }),
    },
  });

  const startedAt = Date.now();
  try {
    // RLS で anon は 0 件返るが、リクエストは Supabase に届くので pause 防止になる
    const { error } = await supabase
      .from("tenants")
      .select("id", { count: "exact", head: true });

    const elapsedMs = Date.now() - startedAt;

    if (error) {
      console.error("[keepalive] Supabase error:", error.message, { elapsedMs });
      return NextResponse.json(
        { ok: false, error: error.message, elapsedMs },
        { status: 200 },
      );
    }

    console.log("[keepalive] OK", { elapsedMs });
    return NextResponse.json({
      ok: true,
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
