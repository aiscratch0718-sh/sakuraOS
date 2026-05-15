"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Target,
  Star,
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Sparkles,
  Crown,
  Zap,
  Shield,
  Flame,
  Heart,
  Wrench,
  Hammer,
  HardHat,
  ClipboardCheck,
  Gem,
  Medal,
  ChevronRight,
} from "lucide-react";

/* ============================================================
   型 / 定数
   ============================================================ */

type Rarity = "common" | "rare" | "epic" | "legendary";

type Badge = {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  earned: boolean;
  earnedAt?: string;
  icon: typeof Star;
  iconColor: string;
};

type Quest = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number; // 0-100
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: string;
  category: "personal" | "team";
  icon: typeof Target;
};

const RARITY_META: Record<Rarity, { label: string; color: string; bg: string; ring: string }> = {
  common: { label: "COMMON", color: "#64748b", bg: "bg-slate-100", ring: "ring-slate-300" },
  rare: { label: "RARE", color: "#2563eb", bg: "bg-blue-50", ring: "ring-blue-300" },
  epic: { label: "EPIC", color: "#d97706", bg: "bg-amber-50", ring: "ring-amber-300" },
  legendary: { label: "LEGENDARY", color: "#7c3aed", bg: "bg-violet-50", ring: "ring-violet-400" },
};

type TabKey = "personal" | "team" | "badges";

const TABS: Array<{ key: TabKey; label: string; icon: typeof Target }> = [
  { key: "personal", label: "進行中クエスト", icon: Target },
  { key: "team", label: "チームクエスト", icon: Users },
  { key: "badges", label: "バッジ一覧", icon: Award },
];

/* ============================================================
   モック データ
   ============================================================ */

const MOCK_BADGES: Badge[] = [
  {
    id: "b1",
    name: "REPORT3 マスター",
    description: "REPORT3 を連続 30 日提出",
    rarity: "epic",
    earned: true,
    earnedAt: "2026-05-10",
    icon: ClipboardCheck,
    iconColor: "#d97706",
  },
  {
    id: "b2",
    name: "ベテラン現場主任",
    description: "案件 50 件以上を完遂",
    rarity: "legendary",
    earned: true,
    earnedAt: "2026-05-08",
    icon: Crown,
    iconColor: "#7c3aed",
  },
  {
    id: "b3",
    name: "安全管理士",
    description: "ヒヤリハット報告 10 件以上",
    rarity: "rare",
    earned: true,
    earnedAt: "2026-05-05",
    icon: Shield,
    iconColor: "#2563eb",
  },
  {
    id: "b4",
    name: "原価入力エキスパート",
    description: "原価入力 100 件達成",
    rarity: "epic",
    earned: true,
    earnedAt: "2026-04-28",
    icon: TrendingUp,
    iconColor: "#d97706",
  },
  {
    id: "b5",
    name: "配管職人",
    description: "給排水工事 20 件完遂",
    rarity: "rare",
    earned: true,
    earnedAt: "2026-04-20",
    icon: Wrench,
    iconColor: "#2563eb",
  },
  {
    id: "b6",
    name: "ガス配管マイスター",
    description: "ガス配管工事 10 件完遂",
    rarity: "rare",
    earned: true,
    earnedAt: "2026-04-15",
    icon: Flame,
    iconColor: "#2563eb",
  },
  {
    id: "b7",
    name: "チームプレイヤー",
    description: "チームクエストを 5 つ達成",
    rarity: "common",
    earned: true,
    icon: Heart,
    iconColor: "#64748b",
  },
  {
    id: "b8",
    name: "スピードランナー",
    description: "予定より早く 10 案件完遂",
    rarity: "epic",
    earned: true,
    earnedAt: "2026-04-02",
    icon: Zap,
    iconColor: "#d97706",
  },
  {
    id: "b9",
    name: "品質の守護者",
    description: "品質スコア A+ を 3 ヶ月維持",
    rarity: "legendary",
    earned: false,
    icon: Gem,
    iconColor: "#7c3aed",
  },
  {
    id: "b10",
    name: "1 万 XP 達成",
    description: "累計 10,000 XP 獲得",
    rarity: "common",
    earned: true,
    icon: Medal,
    iconColor: "#64748b",
  },
  {
    id: "b11",
    name: "ハンマー職人",
    description: "改修工事を 15 件完遂",
    rarity: "rare",
    earned: false,
    icon: Hammer,
    iconColor: "#2563eb",
  },
  {
    id: "b12",
    name: "現場リーダー",
    description: "リーダーとして 30 案件指揮",
    rarity: "epic",
    earned: false,
    icon: HardHat,
    iconColor: "#d97706",
  },
];

const MOCK_PERSONAL_QUESTS: Quest[] = [
  {
    id: "q1",
    title: "今週の REPORT3 マスター",
    description: "今週中に REPORT3 を 7 日連続で提出する",
    xpReward: 500,
    progress: 71,
    currentValue: 5,
    targetValue: 7,
    unit: "日",
    deadline: "2026-05-18",
    category: "personal",
    icon: ClipboardCheck,
  },
  {
    id: "q2",
    title: "原価入力の達人",
    description: "今月中に原価を 30 件入力する",
    xpReward: 800,
    progress: 80,
    currentValue: 24,
    targetValue: 30,
    unit: "件",
    deadline: "2026-05-31",
    category: "personal",
    icon: TrendingUp,
  },
  {
    id: "q3",
    title: "安全第一",
    description: "ヒヤリハットを今月 3 件以上報告する",
    xpReward: 300,
    progress: 33,
    currentValue: 1,
    targetValue: 3,
    unit: "件",
    deadline: "2026-05-31",
    category: "personal",
    icon: Shield,
  },
  {
    id: "q4",
    title: "案件完遂チャレンジ",
    description: "進行中案件を期日内に 2 件完了する",
    xpReward: 1_200,
    progress: 50,
    currentValue: 1,
    targetValue: 2,
    unit: "件",
    deadline: "2026-06-30",
    category: "personal",
    icon: Trophy,
  },
];

const MOCK_TEAM_QUESTS: Quest[] = [
  {
    id: "t1",
    title: "チーム全員 REPORT3 連続提出",
    description: "チーム全員(5 名)が 7 日連続で REPORT3 を提出する",
    xpReward: 2_000,
    progress: 60,
    currentValue: 3,
    targetValue: 5,
    unit: "名",
    deadline: "2026-05-20",
    category: "team",
    icon: Users,
  },
  {
    id: "t2",
    title: "宮城県全現場 進捗 80% 突破",
    description: "進行中の全 8 現場が進捗 80% を超える",
    xpReward: 3_500,
    progress: 50,
    currentValue: 4,
    targetValue: 8,
    unit: "現場",
    deadline: "2026-06-30",
    category: "team",
    icon: TrendingUp,
  },
  {
    id: "t3",
    title: "今月のヒヤリハット 20 件達成",
    description: "全社で今月中にヒヤリハット報告を 20 件集める",
    xpReward: 1_500,
    progress: 75,
    currentValue: 15,
    targetValue: 20,
    unit: "件",
    deadline: "2026-05-31",
    category: "team",
    icon: Shield,
  },
];

const MOCK_FEATURED_QUEST: Quest = {
  id: "featured-1",
  title: "🎯 今月のチャレンジ:さくら株式会社 配管王 への道",
  description: "今月中に「給排水工事 5 件 / 給湯設備 3 件 / 配管点検 10 件」を完遂してエピックバッジを獲得",
  xpReward: 5_000,
  progress: 85,
  currentValue: 16,
  targetValue: 18,
  unit: "件",
  deadline: "2026-05-31",
  category: "personal",
  icon: Sparkles,
};

const MOCK_RECOMMENDED_ACTIONS = [
  { id: "a1", icon: ClipboardCheck, text: "本日の REPORT3 を提出", xp: 50, color: "#2563eb" },
  { id: "a2", icon: TrendingUp, text: "原価を 1 件入力", xp: 30, color: "#d97706" },
  { id: "a3", icon: Shield, text: "ヒヤリハットを報告", xp: 100, color: "#10b981" },
];

const MOCK_UPCOMING = [
  { id: "u1", date: "2026-05-15", title: "週次 REPORT3 締切", type: "deadline" },
  { id: "u2", date: "2026-05-18", title: "新規バッジ「点検王」解放", type: "release" },
  { id: "u3", date: "2026-05-31", title: "月次クエスト終了", type: "deadline" },
];

/* ============================================================
   メインコンポーネント
   ============================================================ */

export function GamificationClient({ userName }: { userName: string }) {
  const [activeTab, setActiveTab] = useState<TabKey>("personal");

  // 集計
  const stats = useMemo(() => {
    const totalBadges = MOCK_BADGES.length;
    const earnedBadges = MOCK_BADGES.filter((b) => b.earned).length;
    const totalQuests = MOCK_PERSONAL_QUESTS.length + MOCK_TEAM_QUESTS.length;
    const avgProgress = Math.round(
      [...MOCK_PERSONAL_QUESTS, ...MOCK_TEAM_QUESTS].reduce(
        (s, q) => s + q.progress,
        0,
      ) / totalQuests,
    );
    return {
      level: 18,
      totalXp: 128_450,
      nextLevelXp: 135_000,
      questCompletionPct: avgProgress,
      earnedBadges,
      totalBadges,
    };
  }, []);

  const xpToNextLevel = stats.nextLevelXp - stats.totalXp;
  const levelProgress = Math.round(
    ((stats.totalXp - 120_000) / (stats.nextLevelXp - 120_000)) * 100,
  );

  // 最近獲得バッジ(降順)
  const recentEarnedBadges = useMemo(
    () =>
      MOCK_BADGES.filter((b) => b.earned && b.earnedAt)
        .sort((a, b) => (a.earnedAt! < b.earnedAt! ? 1 : -1))
        .slice(0, 4),
    [],
  );

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {/* ヘッダー */}
      <header className="flex items-center justify-between">
        <div>
          <nav className="text-[11px] text-slate-500" aria-label="パンくず">
            <span>SAKURA OS</span>
            <span className="mx-1">/</span>
            <span className="font-medium text-slate-700">クエスト・バッジ</span>
          </nav>
          <h1 className="mt-0.5 flex items-center gap-2 text-base font-semibold text-slate-900">
            <Trophy className="h-4 w-4 text-amber-500" />
            クエスト・バッジ
            <span className="text-xs font-normal text-slate-500">
              業務へのモチベーション、スキル成長、チーム連携を可視化します
            </span>
          </h1>
        </div>
      </header>

      {/* KPI 4 cards */}
      <div className="grid grid-cols-4 gap-3">
        <KpiCard
          label="現在のレベル"
          value={`Lv. ${stats.level}`}
          subText={`次まで ${xpToNextLevel.toLocaleString()} XP`}
          icon={Crown}
          accent="border-l-violet-500"
          iconColor="text-violet-600"
        />
        <KpiCard
          label="累計 XP"
          value={stats.totalXp.toLocaleString()}
          subText="今月 +8,250 XP"
          icon={Zap}
          accent="border-l-blue-500"
          iconColor="text-blue-600"
        />
        <KpiCard
          label="クエスト達成率"
          value={`${stats.questCompletionPct}%`}
          subText={`${MOCK_PERSONAL_QUESTS.length + MOCK_TEAM_QUESTS.length} 件進行中`}
          icon={Target}
          accent="border-l-emerald-500"
          iconColor="text-emerald-600"
        />
        <KpiCard
          label="獲得バッジ"
          value={`${stats.earnedBadges} / ${stats.totalBadges}`}
          subText="次は 品質の守護者"
          icon={Award}
          accent="border-l-amber-500"
          iconColor="text-amber-600"
        />
      </div>

      {/* タブ */}
      <div role="tablist" aria-label="クエストとバッジ" className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setActiveTab(t.key)}
              className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* メイン: 中央 9 col / 右 3 col */}
      <div className="grid grid-cols-12 gap-3">
        {/* === 中央 === */}
        <section className="col-span-9 flex flex-col gap-3">
          {/* Featured Quest(今月のチャレンジ)*/}
          <FeaturedQuestCard quest={MOCK_FEATURED_QUEST} />

          {/* タブごとの content */}
          {activeTab === "personal" && (
            <CardSection title="進行中の個人クエスト" icon={Target}>
              <ul className="flex flex-col gap-2">
                {MOCK_PERSONAL_QUESTS.map((q) => (
                  <QuestCard key={q.id} quest={q} />
                ))}
              </ul>
            </CardSection>
          )}

          {activeTab === "team" && (
            <CardSection title="進行中のチームクエスト" icon={Users}>
              <ul className="flex flex-col gap-2">
                {MOCK_TEAM_QUESTS.map((q) => (
                  <QuestCard key={q.id} quest={q} />
                ))}
              </ul>
            </CardSection>
          )}

          {activeTab === "badges" && (
            <CardSection title="バッジ一覧" icon={Award}>
              <div className="grid grid-cols-4 gap-3">
                {MOCK_BADGES.map((b) => (
                  <BadgeCard key={b.id} badge={b} />
                ))}
              </div>
            </CardSection>
          )}
        </section>

        {/* === 右サイドバー === */}
        <aside className="col-span-3 flex flex-col gap-3">
          {/* ユーザー情報 */}
          <CardSection title="プロフィール" icon={Crown}>
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-2xl font-bold text-white shadow-md"
                aria-hidden
              >
                {userName.charAt(0)}
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-900">{userName}</div>
                <div className="text-[10px] text-slate-500">配管職人</div>
              </div>
              <div className="mt-1 w-full rounded-md border border-violet-200 bg-violet-50 px-2 py-1.5">
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-[10px] font-medium text-violet-700">Lv. {stats.level}</span>
                  <span className="text-[10px] text-violet-600">
                    {levelProgress}%
                  </span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-violet-100"
                  role="progressbar"
                  aria-valuenow={levelProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`レベルアップまで ${levelProgress}%`}
                >
                  <div
                    className="h-full bg-violet-500 transition-all"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
                <div className="mt-1 text-center text-[9px] text-violet-600">
                  Lv. {stats.level + 1} まで {xpToNextLevel.toLocaleString()} XP
                </div>
              </div>
            </div>
          </CardSection>

          {/* 最近獲得したバッジ */}
          <CardSection title="最近獲得したバッジ" icon={Sparkles}>
            <ul className="flex flex-col gap-1.5">
              {recentEarnedBadges.map((b) => {
                const meta = RARITY_META[b.rarity];
                const Icon = b.icon;
                return (
                  <li
                    key={b.id}
                    className={`flex items-center gap-2 rounded-md border border-slate-100 ${meta.bg} px-2 py-1.5`}
                  >
                    <Icon
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: meta.color }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[11px] font-medium text-slate-800">
                        {b.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
                        <span style={{ color: meta.color }} className="font-semibold">
                          {meta.label}
                        </span>
                        <span>{b.earnedAt}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardSection>

          {/* おすすめアクション */}
          <CardSection title="おすすめアクション" icon={Zap}>
            <ul className="flex flex-col gap-1.5">
              {MOCK_RECOMMENDED_ACTIONS.map((a) => {
                const Icon = a.icon;
                return (
                  <li
                    key={a.id}
                    className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5"
                  >
                    <Icon
                      className="h-3.5 w-3.5 flex-shrink-0"
                      style={{ color: a.color }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate text-[11px] text-slate-800">
                      {a.text}
                    </span>
                    <span className="whitespace-nowrap rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
                      +{a.xp} XP
                    </span>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/pc/report3/new"
              className="mt-2 flex items-center justify-center gap-1 rounded-md border border-blue-500 bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              REPORT3 を入力
              <ChevronRight className="h-3 w-3" />
            </Link>
          </CardSection>

          {/* 今後の予定 */}
          <CardSection title="今後の予定" icon={Calendar}>
            <ul className="flex flex-col gap-1.5">
              {MOCK_UPCOMING.map((u) => (
                <li
                  key={u.id}
                  className="flex items-start gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5"
                >
                  <Clock
                    className={`mt-0.5 h-3 w-3 flex-shrink-0 ${
                      u.type === "deadline" ? "text-rose-500" : "text-emerald-500"
                    }`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium text-slate-800">
                      {u.title}
                    </div>
                    <div className="text-[9px] text-slate-500">{u.date}</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardSection>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   サブコンポーネント
   ============================================================ */

function CardSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Target;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <Icon className="h-3.5 w-3.5 text-blue-600" />
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function KpiCard({
  label,
  value,
  subText,
  icon: Icon,
  accent,
  iconColor,
}: {
  label: string;
  value: string;
  subText: string;
  icon: typeof Target;
  accent: string;
  iconColor: string;
}) {
  return (
    <div className={`flex h-[88px] flex-col rounded-lg border border-slate-200 bg-white p-3 border-l-4 ${accent}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
      </div>
      <div className="mt-1 truncate text-lg font-bold leading-none text-slate-900">{value}</div>
      <div className="mt-auto truncate text-[10px] text-slate-500">{subText}</div>
    </div>
  );
}

function FeaturedQuestCard({ quest }: { quest: Quest }) {
  return (
    <section
      className="overflow-hidden rounded-lg border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 shadow-sm"
      aria-label="今月のチャレンジ"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-white shadow-md">
          <Sparkles className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              FEATURED
            </span>
            <span className="text-[10px] text-slate-500">期限: {quest.deadline}</span>
          </div>
          <h3 className="mt-1 text-sm font-semibold text-slate-900">{quest.title}</h3>
          <p className="mt-0.5 text-[11px] text-slate-700">{quest.description}</p>

          <div className="mt-2">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[11px] font-semibold text-amber-800">
                {quest.currentValue} / {quest.targetValue} {quest.unit}
              </span>
              <span className="text-[11px] font-bold text-amber-900">{quest.progress}%</span>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-amber-100"
              role="progressbar"
              aria-valuenow={quest.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`featured quest 進捗 ${quest.progress}%`}
            >
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all"
                style={{ width: `${quest.progress}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 text-center">
          <div className="text-[10px] font-medium text-amber-700">報酬</div>
          <div className="text-lg font-bold text-amber-800">
            +{quest.xpReward.toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-700">XP</div>
        </div>
      </div>
    </section>
  );
}

function QuestCard({ quest }: { quest: Quest }) {
  const Icon = quest.icon;
  const isClose = quest.progress >= 80;

  return (
    <li className="rounded-md border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50/50">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md ${
            isClose ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
          }`}
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900">{quest.title}</h3>
            <span className="flex-shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              +{quest.xpReward.toLocaleString()} XP
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-600">{quest.description}</p>

          <div className="mt-2">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[10px] text-slate-600">
                {quest.currentValue} / {quest.targetValue} {quest.unit}
                {isClose && (
                  <span className="ml-2 text-[10px] font-semibold text-emerald-600">
                    あと少し!
                  </span>
                )}
              </span>
              <span className="text-[10px] font-semibold text-slate-800">{quest.progress}%</span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={quest.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${quest.title} 進捗 ${quest.progress}%`}
            >
              <div
                className={`h-full transition-all ${
                  isClose ? "bg-emerald-500" : "bg-blue-500"
                }`}
                style={{ width: `${quest.progress}%` }}
              />
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
              <Clock className="h-2.5 w-2.5" />
              期限: {quest.deadline}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  const meta = RARITY_META[badge.rarity];
  const Icon = badge.icon;
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-all ${
        badge.earned ? `${meta.bg} ${meta.ring}` : "border-slate-200 bg-slate-50 grayscale opacity-60"
      }`}
      style={{ borderColor: badge.earned ? meta.color : "transparent" }}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          badge.earned ? "bg-white shadow-sm" : "bg-slate-200"
        }`}
        aria-hidden
      >
        {badge.earned ? (
          <Icon className="h-6 w-6" style={{ color: meta.color }} />
        ) : (
          <Icon className="h-6 w-6 text-slate-400" />
        )}
      </div>
      <div className="min-h-[64px]">
        <div
          className="text-[9px] font-bold tracking-widest"
          style={{ color: badge.earned ? meta.color : "#94a3b8" }}
        >
          {meta.label}
        </div>
        <div className="mt-0.5 text-[11px] font-semibold text-slate-900 leading-tight">
          {badge.name}
        </div>
        <div className="mt-1 text-[9px] leading-relaxed text-slate-600">
          {badge.description}
        </div>
      </div>
      {badge.earned ? (
        <div className="flex w-full items-center justify-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
          <CheckCircle2 className="h-2.5 w-2.5" />
          獲得済
          {badge.earnedAt && <span className="ml-1 text-[8px] text-emerald-600">{badge.earnedAt}</span>}
        </div>
      ) : (
        <div className="flex w-full items-center justify-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
          <Clock className="h-2.5 w-2.5" />
          未獲得
        </div>
      )}
    </div>
  );
}
