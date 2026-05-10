import { requireSession } from "@/server/auth/session";
import { formatJpFullDate } from "@/lib/format";
import { KpiCard } from "@/components/ui/KpiCard";
import { AlertCard } from "@/components/ui/AlertCard";
import { Shishimaru } from "@/components/feature/Shishimaru";
import { ActiveSitesTable } from "@/components/feature/ActiveSitesTable";
import { ActivityTimeline } from "@/components/feature/ActivityTimeline";
import {
  getDashboardKpis,
  getDashboardAlerts,
  getActiveSitesToday,
  getRecentActivity,
} from "@/features/dashboard/queries";
import { generateShishimaruAdvice } from "@/features/dashboard/shishimaru";

export const dynamic = "force-dynamic";

export default async function PcHomePage() {
  const session = await requireSession();

  // すべての集計クエリを並列実行
  const [kpis, alerts, sites, activity] = await Promise.all([
    getDashboardKpis(),
    getDashboardAlerts(),
    getActiveSitesToday(8),
    getRecentActivity(8),
  ]);

  // 獅子丸のサジェスト
  const advice = generateShishimaruAdvice({
    kpis,
    alertCount: alerts.length,
    highSeverityAlertCount: alerts.filter((a) => a.severity === "p1").length,
    expiringQualificationCount: alerts.filter((a) =>
      a.title.includes("資格期限"),
    ).length,
  });

  // KPI 表示用
  const attendanceRate =
    kpis.activeMemberTotal > 0
      ? Math.round((kpis.attendanceCount / kpis.activeMemberTotal) * 100)
      : 0;
  const isExec = session.role === "ceo";
  const greeting = greetingByHour();

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      {/* ページヘッダー */}
      <div className="mb-5 flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-navy flex items-center gap-2">
            <span aria-hidden>📊</span>
            {isExec ? "経営ダッシュボード" : "事務ホーム"}
          </h1>
          <p className="text-[12px] text-ink-2 mt-0.5">
            {formatJpFullDate(new Date())} ─ {greeting}、{session.displayName}さん
          </p>
        </div>
      </div>

      {/* 獅子丸サジェスト(目立つ位置) */}
      <div className="mb-4">
        <Shishimaru
          mood={advice.mood}
          message={advice.message}
          suggestion={advice.suggestion}
        />
      </div>

      {/* KPI 4枚 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiCard
          icon="📋"
          accent="blue"
          label="本日の日報提出"
          value={kpis.todayReports}
          unit="件"
          subText={`今週累計 ${kpis.weekReports} 件`}
        />
        <KpiCard
          icon="👷"
          accent="p3"
          label="本日の出勤"
          value={kpis.attendanceCount}
          unit="名"
          subText={`全${kpis.activeMemberTotal}名中(${attendanceRate}%)`}
        />
        <KpiCard
          icon="🛡️"
          accent="gold"
          label="安全コンボ(全社)"
          value={kpis.safetyComboDays}
          unit="日"
          subText="無事故継続日数"
        />
        <KpiCard
          icon="⏱"
          accent="p4"
          label="今月の累計時間"
          value={kpis.monthHours.toFixed(1)}
          unit="h"
          subText={`人件費 概算 ¥${Math.round(kpis.monthLaborYen).toLocaleString("ja-JP")}`}
        />
      </div>

      {/* 要対応アラート(0件なら表示されない) */}
      {alerts.length > 0 && (
        <div className="mb-4">
          <AlertCard items={alerts} />
        </div>
      )}

      {/* 本日の稼働現場 */}
      <section className="bg-panel border border-line rounded-panel mb-4 overflow-hidden">
        <header className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
            <span aria-hidden>🏗️</span>
            本日の稼働現場
          </h2>
          <span className="text-[10px] text-ink-3">
            データ元: projects × report3_entries
          </span>
        </header>
        <div className="p-2">
          <ActiveSitesTable sites={sites} />
        </div>
      </section>

      {/* 2列: 承認待ち件数表示 + 今日の活動タイムライン */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 承認待ち概況 */}
        <section className="bg-panel border border-line rounded-panel overflow-hidden">
          <header className="px-4 py-3 border-b border-line flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
              <span aria-hidden>✓</span>
              承認・処理キュー
            </h2>
          </header>
          <div className="p-4 space-y-2.5">
            <QueueRow
              icon="📝"
              label="日報の承認待ち"
              count={kpis.needApprovalCount}
              accent={kpis.needApprovalCount > 5 ? "p1" : kpis.needApprovalCount > 0 ? "p2" : "p3"}
              href="/pc/approvals"
            />
            <QueueRow
              icon="📋"
              label="期限切れ間近の資格"
              count={alerts.filter((a) => a.title.includes("資格期限")).length}
              accent="p2"
              href="/pc/qualifications"
            />
            <QueueRow
              icon="⚠"
              label="未対応のヒヤリハット"
              count={alerts.filter((a) => a.title.includes("ヒヤリハット")).length}
              accent="p1"
              href="/pc/incidents"
            />
          </div>
        </section>

        {/* タイムライン */}
        <section className="bg-panel border border-line rounded-panel overflow-hidden">
          <header className="px-4 py-3 border-b border-line flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
              <span aria-hidden>⏱</span>
              今日の活動タイムライン
            </h2>
            <span className="text-[10px] text-ink-3">audit_log</span>
          </header>
          <div className="p-4">
            <ActivityTimeline items={activity} />
          </div>
        </section>
      </div>
    </div>
  );
}

function QueueRow({
  icon,
  label,
  count,
  accent,
  href,
}: {
  icon: string;
  label: string;
  count: number;
  accent: "p1" | "p2" | "p3";
  href: string;
}) {
  const accentBg = {
    p1: "bg-p1/10 text-p1",
    p2: "bg-p2/10 text-p2",
    p3: "bg-p3/10 text-p3",
  }[accent];

  const isEmpty = count === 0;

  return (
    <a
      href={href}
      className={`flex items-center gap-3 p-3 rounded-btn border border-line hover:bg-panel2 transition-colors ${isEmpty ? "opacity-60" : ""}`}
    >
      <div
        aria-hidden
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-[16px] ${accentBg}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold text-ink">{label}</div>
        <div className="text-[10px] text-ink-3">
          {isEmpty ? "対応すべき項目はありません" : "クリックで対応画面へ"}
        </div>
      </div>
      <div
        className={`text-[24px] font-extrabold leading-none ${isEmpty ? "text-ink-3" : `text-${accent}`}`}
      >
        {count}
      </div>
    </a>
  );
}

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 5) return "おそくまでお疲れさまです";
  if (h < 11) return "おはようございます";
  if (h < 17) return "お疲れさまです";
  if (h < 22) return "お疲れさまです";
  return "遅くまでお疲れさまです";
}
