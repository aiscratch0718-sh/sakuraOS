import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Tag } from "@/components/ui/Tag";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SakuraShishimaru } from "@/components/feature/SakuraShishimaru";
import { SkillRadarChart } from "@/components/feature/SkillRadarChart";
import {
  getUserStatus,
  type SkillParameters,
  type GrantedTitle,
} from "@/features/skills/queries";
import { getMyBalance } from "@/features/points/queries";
import { GrantTitleButton } from "./_components/GrantTitleButton";

export const dynamic = "force-dynamic";

const PARAM_KEYS = [
  { key: "technical", label: "技術力", color: "var(--p2)" },
  { key: "judgment", label: "判断力", color: "#2563EB" },
  { key: "safety", label: "安全", color: "var(--p3)" },
  { key: "communication", label: "報連相", color: "var(--p4)" },
  { key: "stamina", label: "体力", color: "var(--p2)" },
  { key: "responsibility", label: "責任感", color: "var(--p1)" },
] as const;

const RARITY_META: Record<
  GrantedTitle["rarity"],
  { label: string; variant: "bronze" | "silver" | "gold" | "p4" }
> = {
  bronze: { label: "★☆☆ 銅", variant: "bronze" },
  silver: { label: "★★☆ 銀", variant: "silver" },
  gold: { label: "★★★ 金", variant: "gold" },
  platinum: { label: "★★★★ 白金", variant: "p4" },
};

function calcRank(value: number): { label: string; cls: string } {
  if (value >= 90) return { label: "S", cls: "bg-gold/20 text-[#7a5c00]" };
  if (value >= 80) return { label: "A", cls: "bg-p1-light text-p1" };
  if (value >= 65) return { label: "B", cls: "bg-blue/15 text-blue" };
  if (value >= 50) return { label: "C", cls: "bg-p2-light text-p2" };
  if (value >= 30) return { label: "D", cls: "bg-graybg text-ink-2" };
  return { label: "E", cls: "bg-graybg text-ink-3" };
}

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const targetUserId = params.user ?? session.userId;
  const isOwnPage = targetUserId === session.userId;
  const isAdmin = ["office", "ceo", "system"].includes(session.role);

  const sb = await createClient();

  // 対象ユーザーの基本情報を取得
  const [{ data: targetProfile }, status, balance] = await Promise.all([
    sb
      .from("profiles")
      .select("display_name, role")
      .eq("id", targetUserId)
      .maybeSingle(),
    getUserStatus(targetUserId),
    getMyBalance(targetUserId),
  ]);

  const displayName = targetProfile?.display_name ?? "—";
  const roleLabel = roleToLabel(targetProfile?.role as string);

  const p = status.parameters;
  const initial = displayName.slice(0, 1);
  const expRate = (p.exp / Math.max(1, p.expToNext)) * 100;

  // レーダーチャート用 6軸データ
  const radarAxes = [
    { label: PARAM_KEYS[0].label, value: p.technical, color: PARAM_KEYS[0].color },
    { label: PARAM_KEYS[1].label, value: p.judgment, color: PARAM_KEYS[1].color },
    { label: PARAM_KEYS[2].label, value: p.safety, color: PARAM_KEYS[2].color },
    { label: PARAM_KEYS[3].label, value: p.communication, color: PARAM_KEYS[3].color },
    { label: PARAM_KEYS[4].label, value: p.stamina, color: PARAM_KEYS[4].color },
    { label: PARAM_KEYS[5].label, value: p.responsibility, color: PARAM_KEYS[5].color },
  ] as const;

  // さくらししまるからのアドバイス(最弱パラメータを伸ばすよう促す)
  const lowest = PARAM_KEYS.reduce((min, k) => {
    const v = p[k.key as keyof SkillParameters] as number;
    return v < (p[min.key as keyof SkillParameters] as number) ? k : min;
  }, PARAM_KEYS[0]);
  const lowestValue = p[lowest.key as keyof SkillParameters] as number;
  const adviceMsg =
    lowestValue < 30
      ? `${lowest.label}が伸びしろだよ。日々の積み重ねで自然と上がっていくよ。`
      : lowestValue < 70
        ? `${lowest.label}があと +${Math.min(80, lowestValue + 12) - lowestValue}pt で B 昇格だよ! 焦らずいこう。`
        : `バランスが整っているね。安定した成長だよ!`;

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      {/* パンくず */}
      <div className="mb-3 flex items-center gap-2 text-[12px]">
        <Link href="/pc/profile" className="text-blue underline">
          プロフィール
        </Link>
        <span className="text-ink-3">/</span>
        <span className="text-ink-2">ステータス</span>
        {!isOwnPage && (
          <span className="ml-auto text-ink-3">
            {displayName} さんのステータスを表示中
          </span>
        )}
      </div>

      <h1 className="text-xl font-extrabold text-navy mb-1 flex items-center gap-2">
        <span aria-hidden>👤</span>
        {isOwnPage ? "あなたのステータス" : `${displayName} のステータス`}
      </h1>
      <p className="text-[12px] text-ink-2 mb-5">
        実業務での貢献を 6 軸パラメータで可視化しています
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* === 左: キャラクターカード === */}
        <section className="bg-panel border border-line rounded-panel overflow-hidden">
          <header className="px-4 py-3 border-b border-line flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
              <span aria-hidden>⚡</span>キャラクターカード
            </h2>
            <Tag variant="p4">Lv.{p.level}</Tag>
          </header>
          <div className="p-4">
            {/* アバター + 名前 */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-16 h-16 rounded-full bg-p1 text-white flex items-center justify-center font-extrabold text-[28px]"
                aria-hidden
              >
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[18px] font-extrabold text-ink">
                  {displayName}
                </div>
                <div className="text-[11px] text-ink-3 mt-0.5">
                  {roleLabel}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-ink-3">残高</div>
                <div className="text-[18px] font-extrabold text-p4 leading-none">
                  {balance.balance.toLocaleString("ja-JP")}
                  <span className="text-[10px] font-normal text-ink-3 ml-0.5">pt</span>
                </div>
              </div>
            </div>

            {/* EXP */}
            <div className="mb-5">
              <div className="flex justify-between items-baseline text-[11px] mb-1">
                <span className="font-bold text-ink-2">次のレベルまで</span>
                <span className="font-mono text-ink">
                  {p.exp.toLocaleString("ja-JP")} / {p.expToNext.toLocaleString("ja-JP")} EXP
                </span>
              </div>
              <ProgressBar value={expRate} max={100} color="p4" size="md" />
            </div>

            {/* 6 パラメータ */}
            <div className="space-y-2.5">
              {PARAM_KEYS.map((k) => {
                const value = p[k.key as keyof SkillParameters] as number;
                const rank = calcRank(value);
                return (
                  <div key={k.key} className="flex items-center gap-2">
                    <div className="w-16 text-[11px] font-bold text-ink-2 shrink-0">
                      {k.label}
                    </div>
                    <div className="flex-1">
                      <div
                        className="h-2 bg-panel2 rounded-full overflow-hidden border border-line/40"
                        role="progressbar"
                        aria-valuenow={value}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${value}%`,
                            background: `linear-gradient(90deg, ${k.color}, ${k.color}dd)`,
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className="w-9 text-right font-mono font-bold text-[14px]"
                      style={{ color: k.color }}
                    >
                      {value}
                    </div>
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-extrabold ${rank.cls}`}
                      aria-hidden
                    >
                      {rank.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* === 右: レーダーチャート + さくらししまる === */}
        <section className="bg-panel border border-line rounded-panel overflow-hidden">
          <header className="px-4 py-3 border-b border-line">
            <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
              <span aria-hidden>📊</span>スキルレーダー
            </h2>
          </header>
          <div className="p-4 flex flex-col items-center justify-center">
            <SkillRadarChart axes={radarAxes} size={300} accent="p2" />
          </div>
          <div className="px-4 pb-4">
            <SakuraShishimaru
              mood={
                lowestValue >= 70
                  ? "great"
                  : lowestValue >= 30
                    ? "happy"
                    : "thinking"
              }
              message={adviceMsg}
              size="sm"
            />
          </div>
        </section>
      </div>

      {/* === 称号一覧 === */}
      <section className="bg-panel border border-line rounded-panel overflow-hidden mb-4">
        <header className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
            <span aria-hidden>🏅</span>獲得称号
            <span className="text-[11px] text-ink-3 ml-2 font-normal">
              {status.titles.length} 件
            </span>
          </h2>
          {isAdmin && <GrantTitleButton targetUserId={targetUserId} />}
        </header>
        <div className="p-3">
          {status.titles.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-ink-3">
              まだ称号は獲得していません。実績を積んでいきましょう!
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {status.titles.map((t) => {
                const meta = RARITY_META[t.rarity];
                return (
                  <li
                    key={t.grantedId}
                    className="flex items-center gap-3 p-3 rounded-btn border border-line bg-white"
                  >
                    <div className="text-[28px] leading-none flex-shrink-0" aria-hidden>
                      {t.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-extrabold text-ink">
                        {t.displayName}
                      </div>
                      <div className="text-[10px] text-ink-3 leading-tight">
                        {t.description}
                      </div>
                    </div>
                    <Tag variant={meta.variant} size="sm">
                      {meta.label}
                    </Tag>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* === 特殊能力 === */}
      <section className="bg-panel border border-line rounded-panel overflow-hidden mb-4">
        <header className="px-4 py-3 border-b border-line">
          <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
            <span aria-hidden>🃏</span>特殊能力
            <span className="text-[11px] text-ink-3 ml-2 font-normal">
              {status.abilities.length} 件
            </span>
          </h2>
        </header>
        <div className="p-3">
          {status.abilities.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-ink-3">
              特殊能力はまだ獲得していません
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {status.abilities.map((a) => {
                const meta = RARITY_META[a.rarity];
                return (
                  <div
                    key={a.abilityId}
                    className="text-center p-3 rounded-btn border border-line bg-white"
                  >
                    <div className="text-[28px] mb-1" aria-hidden>{a.icon}</div>
                    <div className="text-[12px] font-bold text-ink leading-tight mb-0.5">
                      {a.displayName}
                    </div>
                    <div className="text-[9px] text-ink-3 leading-tight mb-1.5 line-clamp-2">
                      {a.description}
                    </div>
                    <Tag variant={meta.variant} size="sm">
                      {meta.label.split(" ")[1]}
                    </Tag>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* === 保有資格 + 出勤情報 === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-panel border border-line rounded-panel overflow-hidden">
          <header className="px-4 py-3 border-b border-line">
            <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
              <span aria-hidden>📜</span>保有資格
            </h2>
          </header>
          <div className="p-4">
            {status.qualifications.length === 0 ? (
              <p className="py-6 text-center text-[12px] text-ink-3">
                保有資格は登録されていません
              </p>
            ) : (
              <ul className="space-y-2">
                {status.qualifications.map((q, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between p-2 rounded-btn bg-white border border-line"
                  >
                    <span className="text-[13px] font-bold text-ink">
                      {q.name}
                    </span>
                    {q.expiresAt ? (
                      <span className="text-[11px] text-ink-3">
                        期限: {q.expiresAt}
                      </span>
                    ) : (
                      <Tag variant="p3" size="sm">
                        無期限
                      </Tag>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="bg-panel border border-line rounded-panel overflow-hidden">
          <header className="px-4 py-3 border-b border-line">
            <h2 className="text-[14px] font-bold text-ink flex items-center gap-1.5">
              <span aria-hidden>📅</span>今月の出勤状況
            </h2>
          </header>
          <div className="p-4">
            <div className="text-center mb-3">
              <div className="text-[42px] font-extrabold text-p3 leading-none">
                {status.attendance.attendedDays}
                <span className="text-[16px] text-ink-3 font-normal">
                  /{status.attendance.totalDays}
                </span>
              </div>
              <div className="text-[11px] text-ink-3 mt-1">
                日報提出日数(本日まで)
              </div>
            </div>
            <ProgressBar
              value={status.attendance.attendedDays}
              max={Math.max(1, status.attendance.totalDays)}
              color="p3"
              size="md"
              showLabel
              label="出勤率"
            />
          </div>
        </section>
      </div>

      <p className="text-[10px] text-ink-3 mt-4 text-center">
        パラメータは日次バッチで再計算されます。称号やレベルアップは管理者の確認後に確定します。
      </p>
    </div>
  );
}

function roleToLabel(role: string | undefined): string {
  switch (role) {
    case "worker":
      return "作業員";
    case "leader":
      return "現場リーダー";
    case "office":
      return "事務";
    case "ceo":
      return "経営層";
    case "system":
      return "システム";
    default:
      return "—";
  }
}
