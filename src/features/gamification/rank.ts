/**
 * 累計 XP からランク(S/A/B/C/D)を算出する。
 * パワプロ風デザイン参考。
 */
export const RANK_TIERS = [
  { rank: "S", minXp: 5000, color: "#d93642", bg: "#fff0f0" },
  { rank: "A", minXp: 2500, color: "#e8770f", bg: "#fff5e8" },
  { rank: "B", minXp: 1000, color: "#0da870", bg: "#e6fff2" },
  { rank: "C", minXp: 300, color: "#2568c8", bg: "#e8f0ff" },
  { rank: "D", minXp: 0, color: "#7890a8", bg: "#f0f3f7" },
] as const;

export type RankInfo = {
  rank: string;
  color: string;
  bg: string;
  nextRank: string | null;
  nextThreshold: number | null;
  toNext: number | null;
};

export function rankFor(totalXp: number): RankInfo {
  const sorted = RANK_TIERS;
  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i]!;
    if (totalXp >= tier.minXp) {
      const nextTier = sorted[i - 1] ?? null;
      return {
        rank: tier.rank,
        color: tier.color,
        bg: tier.bg,
        nextRank: nextTier?.rank ?? null,
        nextThreshold: nextTier?.minXp ?? null,
        toNext: nextTier ? nextTier.minXp - totalXp : null,
      };
    }
  }
  return {
    rank: "D",
    color: "#7890a8",
    bg: "#f0f3f7",
    nextRank: "C",
    nextThreshold: 300,
    toNext: 300,
  };
}
