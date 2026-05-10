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
 * ライトテーマ・コーポレート系トーンに統一(2026-05-11)。
 *
 * レイアウト:
 *  - ヘッダー: タイトル + ロールタブ + 検索/ヘルプ/通知
 *  - KPI 4 枚(入力率 / 承認待ち / 未請求 / 利益率)
 *  - 中段 3 列: 今日のやること / 承認待ち一覧 / 配置マップ
 *  - 下段 3 列: 現場別進捗 / 売上原価利益 / クエスト・バッジ
 *  - 最下段: お知らせ + よく使うリンク
 *
 * レイアウトのブレイクポイント:
 *  - ~900px ナロー環境でも 3 カラム表示するため md (768px+) で 3-up に切替
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
    <div className="min-h-screen flex flex-col px-6 py-4 bg-gray-50">
      {/* ─────────────── ヘッダー ─────────────── */}
      <header className="mb-3 flex items-end justify-between flex-nowrap gap-2">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-900 leading-tight">ホーム</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            業務の全体状況を確認し、今日の行動を始めましょう。
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <RoleTabs role={role} />
          <div className="flex items-center gap-0.5 ml-1">
            <button
              type="button"
              aria-label="検索"
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
            >
              <svg
                aria-hidden
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="ヘルプ"
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
            >
              <svg
                aria-hidden
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="通知"
              className="relative w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
            >
              <svg
                aria-hidden
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span
                aria-hidden
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"
              />
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────── KPI 4 枚 ─────────────── */}
      <section
        aria-label="主要 KPI"
        className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2"
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
          <MiniDonut value={inputRate} size={80} stroke={7} />
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
        className="grid grid-cols-12 gap-2 mb-2 flex-1"
      >
        {/* 中段: 今日のやること col-span-4 / 承認待ち col-span-4 / 配置マップ col-span-4 */}
        <div className="col-span-12 md:col-span-4">
          <PanelCard title="今日のやること" href="/pc/tasks" hrefLabel="すべてのタスクを見る">
            <TodayTasksList />
          </PanelCard>
        </div>
        <div className="col-span-12 md:col-span-4">
          <PanelCard title="承認待ち一覧" href="/pc/approvals" hrefLabel="すべて見る">
            <ApprovalQueueTable />
          </PanelCard>
        </div>
        <div className="col-span-12 md:col-span-4">
          {canSeeMap ? (
            <PanelCard title="配置マップ(稼働中の現場)" href="/pc/dispatch" hrefLabel="すべて見る">
              <DispatchMapPreview sites={sites} />
            </PanelCard>
          ) : (
            <PanelCard title="クエスト・バッジ">
              <QuestBadgeSummary />
            </PanelCard>
          )}
        </div>

        {/* 下段: 現場別進捗 col-span-4 / 売上原価利益 col-span-4 / クエスト col-span-4 */}
        {canSeeSiteProgress && (
          <div className="col-span-12 md:col-span-4">
            <PanelCard title="現場別進捗" href="/pc/projects" hrefLabel="すべて見る">
              <SiteProgressTable />
            </PanelCard>
          </div>
        )}
        {canSeeRevenue && (
          <div className="col-span-12 md:col-span-4">
            <PanelCard title="売上・原価・利益(今期累計)" href="/pc/reports/finance" hrefLabel="詳細へ">
              <RevenueCostProfitChart />
            </PanelCard>
          </div>
        )}
        {canSeeMap && (
          <div className="col-span-12 md:col-span-4">
            <PanelCard title="クエスト・バッジ">
              <QuestBadgeSummary />
            </PanelCard>
          </div>
        )}
      </section>

      {/* ─────────────── 最下段: お知らせ + よく使うリンク ─────────────── */}
      <section aria-label="お知らせとよく使うリンク" className="grid grid-cols-12 gap-2">
        <div className="col-span-12 md:col-span-4">
          <PanelCard title="お知らせ">
            <NoticesPanel />
          </PanelCard>
        </div>
        <div className="col-span-12 md:col-span-8">
          <PanelCard title="よく使うリンク">
            <QuickLinksFooter />
          </PanelCard>
        </div>
      </section>
    </div>
  );
}

/**
 * 共通パネルカード(タイトル + 任意の「すべて見る」リンク + 本体)。
 * ライトテーマ: 白背景 / 細グレー罫線 / 軽い影。アイコンは描画しない。
 */
function PanelCard({
  title,
  href,
  hrefLabel,
  children,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      <header className="px-3 py-1.5 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-[12px] font-bold text-gray-800">{title}</h2>
        {href && (
          <Link
            href={href}
            className="text-[10px] text-gray-500 hover:text-gray-700 hover:underline font-medium"
          >
            {hrefLabel ?? "すべて見る"} →
          </Link>
        )}
      </header>
      <div className="p-2 flex-1 text-[12px]">{children}</div>
    </section>
  );
}
