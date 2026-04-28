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
    .select("id, work_date, submitted_at, requires_leader_approval, project_id, projects(name)")
    .eq("user_id", session.userId)
    .order("submitted_at", { ascending: false })
    .limit(7);

  const todaySubmitted = recentReports?.some(
    (r) => r.work_date === todayInTokyo(),
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
          <span className="pill-amber">作業員</span>
        </div>
      </div>

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
                (r.projects as { name?: string } | null)?.name ?? "(現場名未設定)";
              return (
                <li
                  key={r.id}
                  className="panel p-3 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold truncate">
                      {projectName}
                    </div>
                    <div className="text-[11px] text-ink-3 mt-0.5">
                      {formatJpDate(r.work_date)} 提出
                    </div>
                  </div>
                  {r.requires_leader_approval ? (
                    <span className="pill-amber">要承認</span>
                  ) : (
                    <span className="pill-teal">提出済</span>
                  )}
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

function todayInTokyo(): string {
  const tokyo = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  const y = tokyo.getFullYear();
  const m = String(tokyo.getMonth() + 1).padStart(2, "0");
  const d = String(tokyo.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
