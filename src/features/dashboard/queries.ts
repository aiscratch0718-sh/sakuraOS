/**
 * ダッシュボード集約クエリ。
 *
 * すべて Server-only(Server Components / Server Actions から呼ぶ)。
 * RLS により tenant スコープは自動で効くため、user_tenant_id() に依存。
 */
import { createClient } from "@/lib/supabase/server";
import type { AlertItemProps } from "@/components/ui/AlertCard";

export type DashboardKpis = {
  /** 本日提出された日報の数 */
  todayReports: number;
  /** 出勤中(本日 hours > 0 の uniq ユーザー) */
  attendanceCount: number;
  /** 全アクティブメンバー */
  activeMemberTotal: number;
  /** 今週の日報提出数 */
  weekReports: number;
  /** 承認待ち件数 */
  needApprovalCount: number;
  /** 安全コンボ日数(直近インシデント無発生連続日数) */
  safetyComboDays: number;
  /** 今月の累計時間 */
  monthHours: number;
  /** 今月の人件費(概算、円) */
  monthLaborYen: number;
};

export type SiteSnapshot = {
  id: string;
  name: string;
  customerName: string | null;
  attendedToday: number;
  monthHours: number;
  status: "on_track" | "caution" | "delayed" | "no_activity";
};

export type ActivityItem = {
  id: string;
  occurredAt: string;
  title: string;
  detail: string;
  accent: "p1" | "p2" | "p3" | "p4" | "blue";
};

/**
 * KPI 4 枚分のデータをまとめて取得。
 */
export async function getDashboardKpis(): Promise<DashboardKpis> {
  const sb = await createClient();

  const today = todayInTokyo();
  const weekStart = startOfWeekJP();
  const monthStart = startOfMonthJP();

  const [
    { count: todayReports },
    { count: weekReports },
    { count: needApprovalCount },
    { data: todayHours },
    { count: activeMemberTotal },
    { data: monthHoursData },
    safetyComboDays,
  ] = await Promise.all([
    sb
      .from("report3_entries")
      .select("id", { count: "exact", head: true })
      .eq("work_date", today),
    sb
      .from("report3_entries")
      .select("id", { count: "exact", head: true })
      .gte("work_date", weekStart),
    sb
      .from("report3_entries")
      .select("id", { count: "exact", head: true })
      .eq("requires_leader_approval", true)
      .is("approved_at", null)
      .is("rejected_at", null),
    sb
      .from("report3_entries")
      .select("user_id, report3_rows(hours)")
      .eq("work_date", today),
    sb
      .from("profiles")
      .select("id", { count: "exact", head: true }),
    sb
      .from("report3_entries")
      .select("user_id, report3_rows(hours)")
      .gte("work_date", monthStart),
    calculateSafetyCombo(),
  ]);

  // 出勤中 = 今日の日報を提出した uniq ユーザー数
  const attendanceCount = new Set(
    (todayHours ?? []).map((e) => e.user_id),
  ).size;

  // 今月の累計時間
  const monthHours = (monthHoursData ?? []).reduce((sum, e) => {
    const rows = (e.report3_rows as Array<{ hours: number }> | null) ?? [];
    return sum + rows.reduce((s, r) => s + Number(r.hours), 0);
  }, 0);

  // 今月の人件費(概算、円)
  let monthLaborYen = 0;
  const userIds = Array.from(
    new Set((monthHoursData ?? []).map((e) => e.user_id)),
  );
  if (userIds.length > 0) {
    const { data: rates } = await sb
      .from("profiles")
      .select("id, hourly_rate_cents")
      .in("id", userIds);
    const rateMap = new Map(
      (rates ?? []).map((r) => [r.id, r.hourly_rate_cents ?? 0]),
    );
    monthLaborYen = (monthHoursData ?? []).reduce((sum, e) => {
      const rows = (e.report3_rows as Array<{ hours: number }> | null) ?? [];
      const userHours = rows.reduce((s, r) => s + Number(r.hours), 0);
      const rate = rateMap.get(e.user_id) ?? 0;
      return sum + (userHours * rate) / 100;
    }, 0);
  }

  return {
    todayReports: todayReports ?? 0,
    weekReports: weekReports ?? 0,
    attendanceCount,
    activeMemberTotal: activeMemberTotal ?? 0,
    needApprovalCount: needApprovalCount ?? 0,
    safetyComboDays,
    monthHours,
    monthLaborYen,
  };
}

/**
 * インシデント無発生連続日数を計算。
 * 直近の incident_reports の occurred_at から今日までの差分。
 * 0件なら null → 計測開始日からの日数(暫定 30 日固定)。
 */
async function calculateSafetyCombo(): Promise<number> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("incident_reports")
    .select("occurred_at")
    .order("occurred_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return 30; // 暫定: インシデント記録なしなら 30 日連続無事故とみなす
  }

  const last = new Date(data[0]!.occurred_at);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, diff);
}

/**
 * 要対応アラート集約。0件のときは空配列。
 */
export async function getDashboardAlerts(): Promise<AlertItemProps[]> {
  const sb = await createClient();

  const today = todayInTokyo();
  const in14days = addDays(today, 14);

  const alerts: AlertItemProps[] = [];

  // 期限切れ間近の資格(14日以内)
  const { data: expiringQuals } = await sb
    .from("user_qualifications")
    .select(
      "id, expires_at, user:profiles!user_qualifications_user_id_fkey(display_name), qualification:qualifications(name)",
    )
    .not("expires_at", "is", null)
    .lte("expires_at", in14days)
    .gte("expires_at", today)
    .order("expires_at", { ascending: true })
    .limit(5);

  if (expiringQuals && expiringQuals.length > 0) {
    const first = expiringQuals[0]!;
    const userName =
      (first.user as { display_name?: string } | null)?.display_name ?? "—";
    const qualName =
      (first.qualification as { name?: string } | null)?.name ?? "資格";
    const detail =
      expiringQuals.length === 1
        ? `${userName}: ${qualName} ${first.expires_at}`
        : `${userName}: ${qualName} ${first.expires_at} 他 ${expiringQuals.length - 1} 件`;
    alerts.push({
      icon: "📋",
      title: `資格期限切れ間近(${expiringQuals.length}件)`,
      detail,
      severity: "p1",
      href: "/pc/qualifications",
    });
  }

  // 承認待ちの日報
  const { count: pendingApprovalCount } = await sb
    .from("report3_entries")
    .select("id", { count: "exact", head: true })
    .eq("requires_leader_approval", true)
    .is("approved_at", null)
    .is("rejected_at", null);

  if (pendingApprovalCount && pendingApprovalCount > 0) {
    alerts.push({
      icon: "✓",
      title: `承認待ち日報(${pendingApprovalCount}件)`,
      detail: `現場リーダー or 事務の承認待ち`,
      severity: pendingApprovalCount > 5 ? "p1" : "p2",
      href: "/pc/approvals",
    });
  }

  // 緊急/高 重大度のヒヤリハットで未対応
  const { count: highIncidentCount } = await sb
    .from("incident_reports")
    .select("id", { count: "exact", head: true })
    .in("severity", ["high", "critical"])
    .neq("status", "resolved");

  if (highIncidentCount && highIncidentCount > 0) {
    alerts.push({
      icon: "⚠",
      title: `重大ヒヤリハット未対応(${highIncidentCount}件)`,
      detail: "対応必須",
      severity: "p1",
      href: "/pc/incidents",
    });
  }

  return alerts;
}

/**
 * 本日の稼働現場一覧。
 * 出勤者のいるアクティブ現場を集計。
 */
export async function getActiveSitesToday(
  limit = 10,
): Promise<SiteSnapshot[]> {
  const sb = await createClient();
  const today = todayInTokyo();
  const monthStart = startOfMonthJP();

  // 今日の日報を現場ごとに集計
  const { data: todayEntries } = await sb
    .from("report3_entries")
    .select(
      "project_id, user_id, project:projects(id, name, customer:customers(name))",
    )
    .eq("work_date", today);

  if (!todayEntries || todayEntries.length === 0) return [];

  // 月次累計時間も取得
  const { data: monthEntries } = await sb
    .from("report3_entries")
    .select("project_id, report3_rows(hours)")
    .gte("work_date", monthStart);

  const projectMap = new Map<
    string,
    {
      name: string;
      customerName: string | null;
      todayUsers: Set<string>;
      monthHours: number;
    }
  >();

  for (const e of todayEntries) {
    // Supabase の関係列は配列形式で返ることがあるため柔軟にハンドリング
    const projRaw = e.project as unknown;
    const proj =
      projRaw && typeof projRaw === "object"
        ? (projRaw as {
            id?: string;
            name?: string;
            customer?:
              | { name?: string }
              | Array<{ name?: string }>
              | null;
          })
        : null;
    if (!proj || !e.project_id) continue;

    const customer = Array.isArray(proj.customer)
      ? proj.customer[0] ?? null
      : proj.customer ?? null;
    const customerName = customer?.name ?? null;

    const existing = projectMap.get(e.project_id);
    if (!existing) {
      projectMap.set(e.project_id, {
        name: proj.name ?? "—",
        customerName,
        todayUsers: new Set([e.user_id]),
        monthHours: 0,
      });
    } else {
      existing.todayUsers.add(e.user_id);
    }
  }

  for (const e of monthEntries ?? []) {
    if (!e.project_id) continue;
    const existing = projectMap.get(e.project_id);
    if (!existing) continue;
    const rows = (e.report3_rows as Array<{ hours: number }> | null) ?? [];
    existing.monthHours += rows.reduce((s, r) => s + Number(r.hours), 0);
  }

  const result: SiteSnapshot[] = Array.from(projectMap.entries()).map(
    ([id, v]) => {
      const status: SiteSnapshot["status"] =
        v.monthHours >= 40
          ? "on_track"
          : v.monthHours >= 20
            ? "caution"
            : v.monthHours > 0
              ? "delayed"
              : "no_activity";
      return {
        id,
        name: v.name,
        customerName: v.customerName,
        attendedToday: v.todayUsers.size,
        monthHours: v.monthHours,
        status,
      };
    },
  );
  return result
    .sort((a, b) => b.attendedToday - a.attendedToday)
    .slice(0, limit);
}

/**
 * 直近の活動タイムライン(audit_log ベース)。
 */
export async function getRecentActivity(limit = 8): Promise<ActivityItem[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("audit_log")
    .select("id, occurred_at, action, target_table, summary")
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data.map((row) => {
    const action = row.action as string;
    const target = row.target_table as string;
    const accent = pickAccent(action, target);
    const title = humanizeAction(action, target, row.summary);
    return {
      id: row.id as string,
      occurredAt: row.occurred_at as string,
      title,
      detail: `${target} / ${action}`,
      accent,
    };
  });
}

function pickAccent(
  action: string,
  target: string,
): ActivityItem["accent"] {
  if (action.includes("approved")) return "p3";
  if (action.includes("rejected")) return "p1";
  if (action.includes("submitted")) return "blue";
  if (target === "incident_reports") return "p1";
  if (target === "report3_entries") return "p3";
  return "p4";
}

function humanizeAction(
  action: string,
  target: string,
  summary: unknown,
): string {
  // summary が JSON で詳細を持つ場合の表示優先
  if (summary && typeof summary === "object" && "title" in (summary as object)) {
    return String((summary as { title: unknown }).title);
  }
  // フォールバック: テーブル × アクション
  const tableLabel: Record<string, string> = {
    report3_entries: "日報",
    incident_reports: "ヒヤリハット",
    receipts: "領収書",
    invoices: "請求書",
    estimates: "見積",
  };
  const actionLabel: Record<string, string> = {
    submitted: "提出",
    approved: "承認",
    rejected: "差戻し",
    created: "作成",
    updated: "更新",
    deleted: "削除",
  };
  return `${tableLabel[target] ?? target} ${actionLabel[action] ?? action}`;
}

// === 日付ユーティリティ(Tokyo TZ) ===

function todayInTokyo(): string {
  const tokyo = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  return ymd(tokyo);
}

function startOfWeekJP(): string {
  const tokyo = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  const day = tokyo.getDay() || 7;
  if (day !== 1) tokyo.setDate(tokyo.getDate() - (day - 1));
  return ymd(tokyo);
}

function startOfMonthJP(): string {
  const tokyo = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  const y = tokyo.getFullYear();
  const m = String(tokyo.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(ymdStr: string, days: number): string {
  const [y, m, d] = ymdStr.split("-").map(Number);
  const dt = new Date(y!, m! - 1, d!);
  dt.setDate(dt.getDate() + days);
  return ymd(dt);
}
