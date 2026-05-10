/**
 * スキルパラメータ・称号関連クエリ(server-only)。
 */
import { createClient } from "@/lib/supabase/server";

export type SkillParameters = {
  technical: number;
  judgment: number;
  safety: number;
  communication: number;
  stamina: number;
  responsibility: number;
  level: number;
  exp: number;
  expToNext: number;
};

export type GrantedTitle = {
  grantedId: string;
  titleId: string;
  code: string;
  displayName: string;
  icon: string;
  description: string;
  rarity: "bronze" | "silver" | "gold" | "platinum";
  rewardPoints: number;
  grantedAt: string;
  reason: string | null;
};

export type UserAbility = {
  abilityId: string;
  code: string;
  displayName: string;
  icon: string;
  description: string;
  rarity: "bronze" | "silver" | "gold" | "platinum";
  grantedAt: string;
};

export type StatusSnapshot = {
  parameters: SkillParameters;
  titles: GrantedTitle[];
  abilities: UserAbility[];
  qualifications: Array<{
    name: string;
    expiresAt: string | null;
  }>;
  attendance: {
    attendedDays: number;
    totalDays: number;
  };
};

const ZERO_PARAMS: SkillParameters = {
  technical: 0,
  judgment: 0,
  safety: 0,
  communication: 0,
  stamina: 0,
  responsibility: 0,
  level: 1,
  exp: 0,
  expToNext: 1000,
};

/**
 * ユーザー1人のステータスを総合取得。
 * 全クエリを並列実行。
 */
export async function getUserStatus(userId: string): Promise<StatusSnapshot> {
  const sb = await createClient();
  const monthStart = startOfMonthJP();

  const [
    { data: paramsRow },
    { data: titles },
    { data: abilities },
    { data: quals },
    { data: monthAttendance },
  ] = await Promise.all([
    sb
      .from("skill_parameters")
      .select(
        "technical, judgment, safety, communication, stamina, responsibility, level, exp, exp_to_next",
      )
      .eq("user_id", userId)
      .maybeSingle(),
    sb
      .from("titles_granted")
      .select(
        "id, granted_at, reason, title:title_definitions(id, code, display_name, icon, description, rarity, reward_points)",
      )
      .eq("user_id", userId)
      .order("granted_at", { ascending: false }),
    sb
      .from("user_abilities")
      .select(
        "granted_at, ability:special_abilities(id, code, display_name, icon, description, rarity)",
      )
      .eq("user_id", userId),
    sb
      .from("user_qualifications")
      .select("expires_at, qualification:qualifications(name)")
      .eq("user_id", userId),
    sb
      .from("report3_entries")
      .select("work_date")
      .eq("user_id", userId)
      .gte("work_date", monthStart),
  ]);

  const parameters: SkillParameters = paramsRow
    ? {
        technical: paramsRow.technical as number,
        judgment: paramsRow.judgment as number,
        safety: paramsRow.safety as number,
        communication: paramsRow.communication as number,
        stamina: paramsRow.stamina as number,
        responsibility: paramsRow.responsibility as number,
        level: paramsRow.level as number,
        exp: paramsRow.exp as number,
        expToNext: paramsRow.exp_to_next as number,
      }
    : ZERO_PARAMS;

  const titlesNormalized: GrantedTitle[] = (titles ?? []).map((row) => {
    const title = Array.isArray(row.title) ? row.title[0] : row.title;
    const t = title as
      | {
          id?: string;
          code?: string;
          display_name?: string;
          icon?: string;
          description?: string;
          rarity?: GrantedTitle["rarity"];
          reward_points?: number;
        }
      | null;
    return {
      grantedId: row.id as string,
      titleId: t?.id ?? "",
      code: t?.code ?? "",
      displayName: t?.display_name ?? "",
      icon: t?.icon ?? "🏅",
      description: t?.description ?? "",
      rarity: t?.rarity ?? "bronze",
      rewardPoints: t?.reward_points ?? 0,
      grantedAt: row.granted_at as string,
      reason: row.reason as string | null,
    };
  });

  const abilitiesNormalized: UserAbility[] = (abilities ?? []).map((row) => {
    const ability = Array.isArray(row.ability) ? row.ability[0] : row.ability;
    const a = ability as
      | {
          id?: string;
          code?: string;
          display_name?: string;
          icon?: string;
          description?: string;
          rarity?: UserAbility["rarity"];
        }
      | null;
    return {
      abilityId: a?.id ?? "",
      code: a?.code ?? "",
      displayName: a?.display_name ?? "",
      icon: a?.icon ?? "✨",
      description: a?.description ?? "",
      rarity: a?.rarity ?? "bronze",
      grantedAt: row.granted_at as string,
    };
  });

  const qualifications = (quals ?? []).map((q) => {
    const quali = Array.isArray(q.qualification)
      ? q.qualification[0]
      : q.qualification;
    return {
      name:
        (quali as { name?: string } | null)?.name ?? "—",
      expiresAt: q.expires_at as string | null,
    };
  });

  // 当月出勤集計
  const attendedDays = new Set(
    (monthAttendance ?? []).map((e) => e.work_date as string),
  ).size;
  const totalDays = daysSinceMonthStart();

  return {
    parameters,
    titles: titlesNormalized,
    abilities: abilitiesNormalized,
    qualifications,
    attendance: { attendedDays, totalDays },
  };
}

/**
 * 称号定義一覧(管理者用 / 称号付与モーダル用)
 */
export async function listTitleDefinitions(): Promise<
  Array<{
    id: string;
    code: string;
    displayName: string;
    icon: string;
    description: string;
    rarity: GrantedTitle["rarity"];
    rewardPoints: number;
  }>
> {
  const sb = await createClient();
  // rarity の重要度順に並べる(platinum → gold → silver → bronze)
  const { data } = await sb
    .from("title_definitions")
    .select("id, code, display_name, icon, description, rarity, reward_points")
    .eq("is_active", true);

  const rarityOrder: Record<GrantedTitle["rarity"], number> = {
    platinum: 0,
    gold: 1,
    silver: 2,
    bronze: 3,
  };
  return (data ?? [])
    .map((r) => ({
      id: r.id as string,
      code: r.code as string,
      displayName: r.display_name as string,
      icon: r.icon as string,
      description: r.description as string,
      rarity: r.rarity as GrantedTitle["rarity"],
      rewardPoints: (r.reward_points as number) ?? 0,
    }))
    .sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
}

function startOfMonthJP(): string {
  const tokyo = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  const y = tokyo.getFullYear();
  const m = String(tokyo.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

function daysSinceMonthStart(): number {
  const tokyo = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  return tokyo.getDate();
}
