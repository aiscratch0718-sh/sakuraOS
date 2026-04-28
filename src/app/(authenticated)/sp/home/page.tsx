import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatJpDate, formatJpFullDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SpHomePage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: recentReports } = await supabase
    .from("report3_entries")
    .select(
      "id, work_date, submitted_at, requires_leader_approval, approved_at, rejected_at, rejection_reason, project_id, projects(name)",
    )
    .eq("user_id", session.userId)
    .order("submitted_at", { ascending: false })
    .limit(10);

  const todaySubmitted = recentReports?.some(
    (r) => r.work_date === todayInTokyo(),
  );

  // 自分の日報のうち、未承認のうちに差戻されたものは「対応待ち」として目立たせる
  const rejectedReports = (recentReports ?? []).filter(
    (r) => !!r.rejected_at && !r.approved_at,
  );

  return (
    <div className="px-4 py-5 max-w-md mx-auto">
      {/* 挨拶カード */}
      <div className="panel-pad mb-3">
        <div className="text-[10px] text-ink-3 font-bold tracking-wider mb-1">
          おはようございます
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[15px] font-bold">{session.displayName} さん</div>
            <div className="text-[11px] text-ink-2 mt-0.5">
              {formatJpFullDate(new Date())}
            </div>
          </div>
          <span className="pill-amber">
            {session.role === "leader" ? "現場リーダー" : "作業員"}
          </span>
        </div>
      </div>

      {/* 差戻しアラート */}
      {rejectedReports.length > 0 && (
        <div className="panel-pad mb-3 bg-red-bg/40 border-red/30">
          <div className="flex items-center gap-1 text-[10px] text-red font-bold tracking-wider mb-1">
            <span aria-hidden>⚠</span> 差戻し
          </div>
          <div className="text-[14px] font-bold text-red mb-1">
            {rejectedReports.length}件の日報が差戻されています
          </div>
          <p className="text-[11px] text-ink-2 mb-2">
            理由を確認のうえ、修正して再提出してください。
          </p>
          <ul className="space-y-1 text-[12px]">
            {rejectedReports.slice(0, 3).map((r) => (
              <li key={r.id}>
                <Link
                  href={`/sp/report3/${r.id}`}
                  className="block bg-white border border-red/30 rounded-btn px-2 py-1.5 hover:bg-red-bg/30 transition-colors"
                >
                  <div className="font-bold text-navy text-[12px]">
                    {(r.projects as { name?: string } | null)?.name ?? "—"}
                  </div>
                  <div className="text-[10px] text-ink-3">
                    {formatJpDate(r.work_date)} の日報 →
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 今日の状態カード */}
      <div className="panel-pad mb-3 bg-blue-bg/50 border-blue-2/40">
        <div className="text-[10px] text-blue font-bold tracking-wider mb-1">
          今日の状況
        </div>
        <div className="text-[14px] font-bold text-navy">
          {todaySubmitted ? "✓ 本日の日報は提出済みです" : "本日の日報は未提出です"}
        </div>
        <div className="text-[11px] text-ink-2 mt-1">
          {todaySubmitted
            ? "明日もよろしくお願いします"
            : "業務終了時に「日報を書く」から入力してください"}
        </div>
      </div>

      {/* メインアクション */}
      <Link
        href="/sp/report3/new"
        className="block w-full bg-pink hover:bg-pink-2 transition-colors text-white text-center py-4 rounded-panel text-[16px] font-bold shadow-card mb-5"
      >
        📝 今日の作業日報を書く
      </Link>

      {/* 直近の提出履歴 */}
      <section>
        <h2 className="text-[12px] font-bold text-ink-2 tracking-wider mb-2 px-1">
          直近の提出履歴
        </h2>

        {!recentReports || recentReports.length === 0 ? (
          <div className="panel-pad text-[12px] text-ink-3 text-center py-6">
            まだ提出された日報はありません。
            <br />
            最初の1件を入力しましょう。
          </div>
        ) : (
          <ul className="space-y-2">
            {recentReports.map((r) => {
              const projectName =
                (r.projects as { name?: string } | null)?.name ??
                "(現場名未設定)";
              const status = pickStatus(r);
              return (
                <li key={r.id}>
                  <Link
                    href={`/sp/report3/${r.id}`}
                    className="panel p-3 flex items-center justify-between hover:bg-blue-bg/20 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold truncate">
                        {projectName}
                      </div>
                      <div className="text-[11px] text-ink-3 mt-0.5">
                        {formatJpDate(r.work_date)} 提出
                      </div>
                    </div>
                    {status}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-8 text-[10px] text-ink-3 text-center">
        Phase B(MVP骨格)— GPS打刻・ゲーミフィ・ナビは順次追加予定
      </p>
    </div>
  );
}

function pickStatus(r: {
  approved_at: string | null;
  rejected_at: string | null;
  requires_leader_approval: boolean;
}) {
  if (r.rejected_at) return <span className="pill-red">差戻し</span>;
  if (r.approved_at) return <span className="pill-teal">承認済</span>;
  if (r.requires_leader_approval) return <span className="pill-amber">要承認</span>;
  return <span className="pill-teal">提出済</span>;
}

function todayInTokyo(): string {
  const tokyo = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  const y = tokyo.getFullYear();
  const m = String(tokyo.getMonth() + 1).padStart(2, "0");
  const d = String(tokyo.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
