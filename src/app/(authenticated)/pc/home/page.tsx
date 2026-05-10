import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { KpiCard } from "@/components/ui/KpiCard";
import {
  getDashboardKpis,
  getActiveSitesToday,
} from "@/features/dashboard/queries";
import { MiniDonut } from "./_components/MiniDonut";
import { TodayTasksList } from "./_components/TodayTasksList";
import { ApprovalQueueTable } from "./_components/ApprovalQueueTable";
import { DispatchMapPreview } from "./_components/DispatchMapPreview";
import { SiteProgressTable } from "./_components/SiteProgressTable";
import { RevenueCostProfitChart } from "./_components/RevenueCostProfitChart";
import { QuestBadgeSummary } from "./_components/QuestBadgeSummary";
import { NoticesPanel } from "./_components/NoticesPanel";
import { QuickLinksFooter } from "./_components/QuickLinksFooter";
import { RoleTabs } from "./_components/RoleTabs";

export const dynamic = "force-dynamic";

/**
 * PC ホーム(/pc/home)— SAKURA OS 統合ダッシュボード。
 *
 * 参照画像: 参照データ/ダッシュボード.png 準拠。
 *
 * レイアウト:
 *  - ヘッダー: タイトル + ロールタブ + 検索/ヘルプ/通知
 *  - KPI 4 枚(入力率 / 承認待ち / 未請求 / 利益率)
 *  - 中段 3 列: 今日のやること / 承認待ち一覧 / 配置マップ
 *  - 下段 3 列: 現場別進捗 / 売上原価利益 / クエスト・バッジ
 *  - 最下段: お知らせ + よく使うリンク
 *
 * ロール別表示:
 *  - worker: KPI + 今日のやること + 承認待ち + クエスト・バッジ + 最下段
 *  - leader: + 配置マップ + 現場別進捗
 *  - office / ceo / system: 全部
 */
export default async function PcHomePage() {
  const session = await requireSession();

  // 既存集計クエリを並列実行(SiteSnapshot は配置マップ & 進捗表示で使う)
  const [kpis, sites] = await Promise.all([
    getDashboardKpis(),
    getActiveSitesToday(6),
  ]);

  // 本日の入力率(出勤予定者ベース。activeMemberTotal がゼロなら 0%)
  const inputRate =
    kpis.activeMemberTotal > 0
      ? Math.round((kpis.attendanceCount / kpis.activeMemberTotal) * 100)
      : 0;

  // TODO(P12-01-data): 以下は本実装まで暫定モック
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
  const canSeeMap = role === "leader" || role === "office" || role === "ceo" || role === "system";
  const canSeeRevenue = role === "office" || role === "ceo" || role === "system";
  const canSeeSiteProgress = role === "leader" || role === "office" || role === "ceo" || role === "system";

  return (
    <div className="min-h-screen flex flex-col overflow-hidden px-4 py-2">
      {/* ─────────────── ヘッダー ─────────────── */}
      <header className="mb-2 flex items-end justify-between flex-nowrap gap-2">
        <div>
          <h1 className="text-[20px] font-extrabold text-navy leading-tight">ホーム</h1>
          <p className="text-[11px] text-ink-2 mt-0.5">
            業務の全体状況を確認し、今日の行動を始めましょう。
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <RoleTabs role={role} />
          <div className="flex items-center gap-0.5 ml-1">
            <button
              type="button"
              aria-label="検索"
              className="w-8 h-8 rounded-full hover:bg-graybg flex items-center justify-center text-ink-2"
            >
              <span aria-hidden className="text-[14px]">🔍</span>
            </button>
            <button
              type="button"
              aria-label="ヘルプ"
              className="w-8 h-8 rounded-full hover:bg-graybg flex items-center justify-center text-ink-2"
            >
              <span aria-hidden className="text-[14px]">❓</span>
            </button>
            <button
              type="button"
              aria-label="通知"
              className="relative w-8 h-8 rounded-full hover:bg-graybg flex items-center justify-center text-ink-2"
            >
              <span aria-hidden className="text-[14px]">🔔</span>
              <span
                aria-hidden
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red"
              />
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────── KPI 4 枚 ─────────────── */}
      <section
        aria-label="主要 KPI"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2"
      >
        {/* 1. 本日の入力率(値+ドーナツを並列表示) */}
        <KpiCard
          accent="blue"
          label="本日の入力率"
          value={inputRate}
          unit="%"
          subText={`入力済 ${kpis.attendanceCount} / 対象 ${kpis.activeMemberTotal} 件`}
          trend={{ dir: "up", value: `${inputDeltaPt}pt`, comparison: "前日比" }}
          href="/pc/reports"
          hrefLabel="詳細へ"
        >
          <MiniDonut value={inputRate} size={64} stroke={7} />
        </KpiCard>

        {/* 2. 承認待ち */}
        <KpiCard
          accent="p1"
          label="承認待ち"
          value={kpis.needApprovalCount}
          unit="件"
          subText={`うち 緊急 ${urgentApprovalCount} 件`}
          trend={{
            dir: approvalDeltaCount < 0 ? "down" : approvalDeltaCount > 0 ? "up" : "flat",
            value: `${Math.abs(approvalDeltaCount)}件`,
            comparison: "前日比",
          }}
          href="/pc/approvals"
          hrefLabel="一覧へ"
        />

        {/* 3. 未請求(確定分) */}
        <KpiCard
          accent="p4"
          label="未請求(確定分)"
          value={`¥${unbilledYen.toLocaleString("ja-JP")}`}
          subText={`件数 ${unbilledCount} 件`}
          trend={{
            dir: "up",
            value: `¥${unbilledDeltaYen.toLocaleString("ja-JP")}`,
            comparison: "前日比",
          }}
          href="/pc/invoices"
          hrefLabel="一覧へ"
        />

        {/* 4. 利益率(今期累計) */}
        <KpiCard
          accent="p3"
          label="利益率(今期累計)"
          value={profitRatePct.toFixed(1)}
          unit="%"
          subText={`利益 ¥${(profitYen / 10_000).toLocaleString("ja-JP")}万 / 売上 ¥${(revenueYen / 10_000).toLocaleString("ja-JP")}万`}
          trend={{ dir: "up", value: `${profitDeltaPt}pt`, comparison: "前期比" }}
          href="/pc/cost"
          hrefLabel="詳細へ"
        />
      </section>

      {/* ─────────────── 中段 + 下段 統合 12 カラム ─────────────── */}
      <section
        aria-label="今日の業務と進捗"
        className="grid grid-cols-1 lg:grid-cols-12 gap-2 mb-2 flex-1"
      >
        {/* 中段: 今日のやること col-span-4 / 承認待ち col-span-4 / 配置マップ col-span-4 */}
        <div className="lg:col-span-4">
          <PanelCard title="今日のやること" icon="📌" href="/pc/tasks" hrefLabel="すべてのタスクを見る">
            <TodayTasksList />
          </PanelCard>
        </div>
        <div className="lg:col-span-4">
          <PanelCard title="承認待ち一覧" icon="✓" href="/pc/approvals" hrefLabel="すべて見る">
            <ApprovalQueueTable />
          </PanelCard>
        </div>
        <div className="lg:col-span-4">
          {canSeeMap ? (
            <PanelCard title="配置マップ(稼働中の現場)" icon="🗺" href="/pc/dispatch" hrefLabel="すべて見る">
              <DispatchMapPreview sites={sites} />
            </PanelCard>
          ) : (
            <PanelCard title="クエスト・バッジ" icon="🏅">
              <QuestBadgeSummary />
            </PanelCard>
          )}
        </div>

        {/* 下段: 現場別進捗 col-span-4 / 売上原価利益 col-span-4 / クエスト col-span-4 */}
        {canSeeSiteProgress && (
          <div className="lg:col-span-4">
            <PanelCard title="現場別進捗" icon="🏗️" href="/pc/projects" hrefLabel="すべて見る">
              <SiteProgressTable />
            </PanelCard>
          </div>
        )}
        {canSeeRevenue && (
          <div className="lg:col-span-4">
            <PanelCard title="売上・原価・利益(今期累計)" icon="📊" href="/pc/reports/finance" hrefLabel="詳細へ">
              <RevenueCostProfitChart />
            </PanelCard>
          </div>
        )}
        {canSeeMap && (
          <div className="lg:col-span-4">
            <PanelCard title="クエスト・バッジ" icon="🏅">
              <QuestBadgeSummary />
            </PanelCard>
          </div>
        )}
      </section>

      {/* ─────────────── 最下段: お知らせ + よく使うリンク ─────────────── */}
      <section aria-label="お知らせとよく使うリンク" className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        <div className="lg:col-span-4">
          <PanelCard title="お知らせ" icon="📢">
            <NoticesPanel />
          </PanelCard>
        </div>
        <div className="lg:col-span-8">
          <PanelCard title="よく使うリンク" icon="⚡">
            <QuickLinksFooter />
          </PanelCard>
        </div>
      </section>
    </div>
  );
}

/**
 * 共通パネルカード(タイトル + 任意の「すべて見る」リンク + 本体)。
 */
function PanelCard({
  title,
  icon,
  href,
  hrefLabel,
  children,
}: {
  title: string;
  icon?: string;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-panel border border-line rounded-card shadow-card overflow-hidden flex flex-col">
      <header className="px-3 py-1.5 border-b border-line flex items-center justify-between">
        <h2 className="text-[12px] font-bold text-ink flex items-center gap-1">
          {icon && <span aria-hidden className="text-[13px]">{icon}</span>}
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="text-[10px] text-blue hover:underline font-medium"
          >
            {hrefLabel ?? "すべて見る"} →
          </Link>
        )}
      </header>
      <div className="p-2 flex-1 text-[12px]">{children}</div>
    </section>
  );
}
