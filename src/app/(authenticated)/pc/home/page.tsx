import Link from "next/link";
import { Bell, CircleHelp, Search } from "lucide-react";
import { requireSession } from "@/server/auth/session";
import { KpiCard } from "@/components/ui/KpiCard";
import {
  getActiveSitesToday,
  getDashboardKpis,
} from "@/features/dashboard/queries";
import { ApprovalQueueTable } from "./_components/ApprovalQueueTable";
import { DispatchMapPreview } from "./_components/DispatchMapPreview";
import { MiniDonut } from "./_components/MiniDonut";
import { NoticesPanel } from "./_components/NoticesPanel";
import { QuestBadgeSummary } from "./_components/QuestBadgeSummary";
import { QuickLinksFooter } from "./_components/QuickLinksFooter";
import { RevenueCostProfitChart } from "./_components/RevenueCostProfitChart";
import { RoleTabs } from "./_components/RoleTabs";
import { SiteProgressTable } from "./_components/SiteProgressTable";
import { TodayTasksList } from "./_components/TodayTasksList";

export const dynamic = "force-dynamic";

export default async function PcHomePage() {
  const session = await requireSession();

  const [kpis, sites] = await Promise.all([
    getDashboardKpis(),
    getActiveSitesToday(6),
  ]);

  const inputRate =
    kpis.activeMemberTotal > 0
      ? Math.round((kpis.attendanceCount / kpis.activeMemberTotal) * 100)
      : 0;

  const unbilledYen = 12_450_000;
  const unbilledCount = 7;
  const unbilledDeltaYen = 1_230_000;
  const profitRatePct = 18.6;
  const profitYen = 24_680_000;
  const revenueYen = 132_600_000;
  const profitDeltaPt = 2.4;
  const urgentApprovalCount = Math.min(3, kpis.needApprovalCount);
  const approvalDeltaCount = -2;
  const inputDeltaPt = 12;

  const role = session.role;
  const canSeeMap =
    role === "leader" || role === "office" || role === "ceo" || role === "system";
  const canSeeRevenue = role === "office" || role === "ceo" || role === "system";
  const canSeeSiteProgress =
    role === "leader" || role === "office" || role === "ceo" || role === "system";

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
      <header className="dashboard-home-header sticky top-0 z-20 flex min-h-[64px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-8 backdrop-blur">
        <div>
          <h1 className="text-[26px] font-black leading-tight tracking-normal text-slate-950">
            ホーム
          </h1>
          <p className="mt-1 text-[14px] text-slate-600">
            業務の全体状況を確認し、今日の行動を始めましょう。
          </p>
        </div>
        <div className="flex items-center gap-6">
          <RoleTabs role={role} />
          <div className="flex items-center gap-4 text-slate-900">
            <button
              type="button"
              aria-label="検索"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
            >
              <Search className="h-6 w-6" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="ヘルプ"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
            >
              <CircleHelp className="h-6 w-6" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="通知"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
            >
              <Bell className="h-6 w-6" aria-hidden />
              <span className="absolute -right-0.5 top-0 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                12
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-home-main flex flex-1 flex-col px-8 py-3">
        <section
          aria-label="主要 KPI"
          className="dashboard-kpi-grid mb-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <KpiCard
            accent="blue"
            label="本日の入力率"
            value={inputRate}
            unit="%"
            subText={`入力済 ${kpis.attendanceCount} / 対象 ${kpis.activeMemberTotal}件`}
            trend={{ dir: "up", value: `+${inputDeltaPt}pt`, comparison: "前日比" }}
            href="/pc/reports"
            hrefLabel="詳細へ"
          >
            {/* 参照画像準拠: 入力率ドーナツは青系
                (KPI #1 全体の blue アクセントと統一) */}
            <MiniDonut
              value={inputRate}
              size={82}
              stroke={7}
              color="#2568c8"
              trackColor="#dbeafe"
            />
          </KpiCard>

          <KpiCard
            accent="p1"
            label="承認待ち"
            value={kpis.needApprovalCount}
            unit="件"
            subText={`うち 緊急 ${urgentApprovalCount}件`}
            trend={{
              dir:
                approvalDeltaCount < 0
                  ? "down"
                  : approvalDeltaCount > 0
                    ? "up"
                    : "flat",
              value: `${Math.abs(approvalDeltaCount)}件`,
              comparison: "前日比",
            }}
            href="/pc/approvals"
            hrefLabel="一覧へ"
          />

          <KpiCard
            accent="p4"
            label="未請求(確定分)"
            value={`¥${unbilledYen.toLocaleString("ja-JP")}`}
            subText={`件数 ${unbilledCount}件`}
            trend={{
              dir: "up",
              value: `+¥${unbilledDeltaYen.toLocaleString("ja-JP")}`,
              comparison: "前日比",
            }}
            href="/pc/invoices"
            hrefLabel="一覧へ"
          />

          <KpiCard
            accent="p3"
            label="利益率(今期累計)"
            value={profitRatePct.toFixed(1)}
            unit="%"
            subText={`利益 ¥${profitYen.toLocaleString("ja-JP")} / 売上 ¥${revenueYen.toLocaleString("ja-JP")}`}
            trend={{ dir: "up", value: `+${profitDeltaPt}pt`, comparison: "前期比" }}
            href="/pc/cost"
            hrefLabel="詳細へ"
          />
        </section>

        <section
          aria-label="今日の業務と進捗"
          className="dashboard-panel-grid mb-2 grid grid-cols-12 gap-3"
        >
          <div className="col-span-12 lg:col-span-4">
            <PanelCard
              title="今日のやること"
              href="/pc/tasks"
              hrefLabel="すべてのタスクを見る"
            >
              <TodayTasksList />
            </PanelCard>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <PanelCard title="承認待ち一覧" href="/pc/approvals" hrefLabel="すべて見る">
              <ApprovalQueueTable />
            </PanelCard>
          </div>
          <div className="col-span-12 lg:col-span-4">
            {canSeeMap ? (
              <PanelCard
                title="配置マップ（稼働中の現場）"
                href="/pc/dispatch-map"
                hrefLabel="すべて見る"
              >
                <DispatchMapPreview sites={sites} />
              </PanelCard>
            ) : (
              <PanelCard title="クエスト・バッジ">
                <QuestBadgeSummary />
              </PanelCard>
            )}
          </div>

          {canSeeSiteProgress && (
            <div className="col-span-12 lg:col-span-4">
              <PanelCard title="現場別進捗" href="/pc/projects" hrefLabel="すべて見る">
                <SiteProgressTable />
              </PanelCard>
            </div>
          )}
          {canSeeRevenue && (
            <div className="col-span-12 lg:col-span-4">
              <PanelCard
                title="売上・原価・利益（今期累計）"
                href="/pc/reports/finance"
                hrefLabel="詳細へ"
              >
                <RevenueCostProfitChart />
              </PanelCard>
            </div>
          )}
          {canSeeMap && (
            <div className="col-span-12 lg:col-span-4">
              <PanelCard title="クエスト・バッジ">
                <QuestBadgeSummary />
              </PanelCard>
            </div>
          )}
        </section>

        <section
          aria-label="お知らせとよく使うリンク"
          className="dashboard-bottom-grid grid flex-1 auto-rows-fr grid-cols-12 gap-5"
        >
          <div className="col-span-12 h-full lg:col-span-5">
            <PanelCard title="お知らせ" compact>
              <NoticesPanel />
            </PanelCard>
          </div>
          <div className="col-span-12 h-full lg:col-span-7">
            <PanelCard title="よく使うリンク" compact>
              <QuickLinksFooter />
            </PanelCard>
          </div>
        </section>
      </main>
    </div>
  );
}

function PanelCard({
  title,
  href,
  hrefLabel,
  accent,
  compact,
  children,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
  accent?: "pink";
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`dashboard-panel ${compact ? "dashboard-panel-compact min-h-[80px]" : "min-h-[200px]"} flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
        accent === "pink" ? "border-rose-100 bg-rose-50/50" : ""
      }`}
    >
      <header className="dashboard-panel-header flex min-h-[47px] items-center justify-between border-b border-slate-200 px-4">
        <h2 className="text-[17px] font-black tracking-normal text-slate-950">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 text-[12px] font-bold text-blue-700 hover:text-blue-800"
          >
            {hrefLabel ?? "すべて見る"}
            <span aria-hidden>›</span>
          </Link>
        )}
      </header>
      <div className="dashboard-panel-body flex-1 p-3 text-[13px]">{children}</div>
    </section>
  );
}
