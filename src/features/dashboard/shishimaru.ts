/**
 * さくら獅子丸 — ルールベース助言エンジン。
 *
 * 設計方針(2026-05-10 ベストプラクティス):
 * - 失敗を罰しない口調(警告でも前向き)
 * - データから具体的に "どう動けば改善するか" を提示
 * - 1回に最大 1 つの提案(認知負荷を抑える)
 * - クライアント確認後に大幅修正される可能性あり(暫定実装)
 *
 * 将来的には Claude API で本格的な分析にアップグレード可能。
 */
import type { ShishimaruMood } from "@/components/feature/Shishimaru";
import type { DashboardKpis } from "./queries";

export type ShishimaruAdvice = {
  mood: ShishimaruMood;
  message: string;
  suggestion?: { label: string; href: string };
};

/**
 * KPI 値・アラート件数を入力に、最も優先度の高い助言を1つ返す。
 *
 * 優先順位(上から強い):
 * 1. 重大ヒヤリハット未対応あり → warning + 「対応する」
 * 2. 期限切れ資格あり → warning + 「資格マスタへ」
 * 3. 承認待ち多すぎ(>5) → warning + 「承認画面へ」
 * 4. 達成率 100%+ → celebrate
 * 5. 達成率 80%+ → great
 * 6. 出勤率 ≥80% → happy
 * 7. データ不足 → thinking
 */
export function generateShishimaruAdvice(input: {
  kpis: DashboardKpis;
  alertCount: number;
  highSeverityAlertCount: number;
  expiringQualificationCount: number;
}): ShishimaruAdvice {
  const { kpis, alertCount, highSeverityAlertCount, expiringQualificationCount } =
    input;

  // 1. 重大ヒヤリハット
  if (highSeverityAlertCount > 0) {
    return {
      mood: "warning",
      message: `重大なヒヤリハットが ${highSeverityAlertCount} 件、まだ対応中じゃ。安全第一、まずはここを片付けるのじゃぞ。`,
      suggestion: { label: "ヒヤリハット一覧へ", href: "/pc/incidents" },
    };
  }

  // 2. 期限切れ資格
  if (expiringQualificationCount > 0) {
    return {
      mood: "warning",
      message: `あと 14 日以内に期限切れになる資格が ${expiringQualificationCount} 件あるぞ。早めに更新の手配をするとよい。`,
      suggestion: { label: "資格マスタへ", href: "/pc/qualifications" },
    };
  }

  // 3. 承認待ち
  if (kpis.needApprovalCount > 5) {
    return {
      mood: "warning",
      message: `承認待ちの日報が ${kpis.needApprovalCount} 件たまっておるぞ。早めに片付けるとみんな安心じゃ。`,
      suggestion: { label: "承認待ちへ", href: "/pc/approvals" },
    };
  }
  if (kpis.needApprovalCount > 0) {
    return {
      mood: "happy",
      message: `承認待ちが ${kpis.needApprovalCount} 件あるぞ。今日中にチェックしてくれるかの。`,
      suggestion: { label: "承認待ちへ", href: "/pc/approvals" },
    };
  }

  // 4. 出勤データから判断
  const attendanceRate =
    kpis.activeMemberTotal > 0
      ? kpis.attendanceCount / kpis.activeMemberTotal
      : 0;

  // 5. 安全コンボ達成
  if (kpis.safetyComboDays >= 50) {
    return {
      mood: "celebrate",
      message: `安全コンボ ${kpis.safetyComboDays} 日達成じゃ! みんなの心がけが現場を守っておる。素晴らしいぞ!`,
    };
  }

  // 6. 高出勤率
  if (attendanceRate >= 0.8) {
    return {
      mood: "great",
      message: `本日 ${kpis.attendanceCount} / ${kpis.activeMemberTotal} 名の出勤、よく揃っておるぞ! 今日も安全に頼むぞ。`,
    };
  }

  // 7. データ無し
  if (kpis.todayReports === 0) {
    return {
      mood: "thinking",
      message:
        "今日はまだ日報が上がってきておらんな。現場が動き出したら教えてくれるかの。",
    };
  }

  // 8. デフォルト(平常)
  return {
    mood: "happy",
    message: `今日は ${kpis.todayReports} 件の日報が届いておる。安全コンボ ${kpis.safetyComboDays} 日継続中じゃ。引き続き気を引き締めていこう!`,
  };
}
