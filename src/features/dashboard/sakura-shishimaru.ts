/**
 * さくらししまる — ルールベース助言エンジン。
 *
 * 設計方針(2026-05-10 ベストプラクティス):
 * - 失敗を罰しない口調(警告でも前向き)
 * - データから具体的に "どう動けば改善するか" を提示
 * - 1回に最大 1 つの提案(認知負荷を抑える)
 * - 口調は親しみやすい現代口語(「〜だよ」「〜してね」)
 * - 機能と乖離した文言は使わない(例:システムが自動検知する事柄を
 *   「教えて」と言わない)
 * - クライアント確認後に大幅修正される可能性あり(暫定実装)
 *
 * 注: 現状は完全にルールベース(Claude API は未統合)。
 * 将来的には Claude API で本格的な分析にアップグレード可能。
 */
import type { SakuraShishimaruMood } from "@/components/feature/SakuraShishimaru";
import type { DashboardKpis } from "./queries";

export type SakuraShishimaruAdvice = {
  mood: SakuraShishimaruMood;
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
export function generateSakuraShishimaruAdvice(input: {
  kpis: DashboardKpis;
  alertCount: number;
  highSeverityAlertCount: number;
  expiringQualificationCount: number;
}): SakuraShishimaruAdvice {
  const { kpis, alertCount, highSeverityAlertCount, expiringQualificationCount } =
    input;

  // 1. 重大ヒヤリハット
  if (highSeverityAlertCount > 0) {
    return {
      mood: "warning",
      message: `重大なヒヤリハットが ${highSeverityAlertCount} 件、まだ対応中だよ。安全第一、まずはここから片付けよう。`,
      suggestion: { label: "ヒヤリハット一覧へ", href: "/pc/incidents" },
    };
  }

  // 2. 期限切れ資格
  if (expiringQualificationCount > 0) {
    return {
      mood: "warning",
      message: `あと 14 日以内に期限切れになる資格が ${expiringQualificationCount} 件あるよ。早めに更新の手配をしておこう。`,
      suggestion: { label: "資格マスタへ", href: "/pc/qualifications" },
    };
  }

  // 3. 承認待ち
  if (kpis.needApprovalCount > 5) {
    return {
      mood: "warning",
      message: `承認待ちの日報が ${kpis.needApprovalCount} 件たまっているよ。早めに片付けるとみんな安心だね。`,
      suggestion: { label: "承認待ちへ", href: "/pc/approvals" },
    };
  }
  if (kpis.needApprovalCount > 0) {
    return {
      mood: "happy",
      message: `承認待ちが ${kpis.needApprovalCount} 件あるよ。今日中にチェックしておこう。`,
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
      message: `安全コンボ ${kpis.safetyComboDays} 日達成だよ! みんなの心がけが現場を守っているね。素晴らしい!`,
    };
  }

  // 6. 高出勤率
  if (attendanceRate >= 0.8) {
    return {
      mood: "great",
      message: `本日 ${kpis.attendanceCount} / ${kpis.activeMemberTotal} 名の出勤、よく揃っているね! 今日も安全に進めていこう。`,
    };
  }

  // 7. データ無し
  if (kpis.todayReports === 0) {
    return {
      mood: "thinking",
      message: "今日はまだ日報が上がってきていないよ。",
    };
  }

  // 8. デフォルト(平常)
  return {
    mood: "happy",
    message: `今日は ${kpis.todayReports} 件の日報が届いているよ。安全コンボ ${kpis.safetyComboDays} 日継続中。引き続き気を引き締めていこう!`,
  };
}
