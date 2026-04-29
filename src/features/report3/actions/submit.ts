"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";
import { Report3InputSchema, type Report3Result } from "../schemas";

/**
 * REPORT3 投稿 Server Action(原子的 fanout 版).
 *
 * Phase 3 拡張(ADR-0001): 単一の Postgres RPC `submit_report3_atomic` で
 * 以下 5 系統の更新を 1 トランザクション内で実行する:
 *   1. report3_entries
 *   2. report3_rows(GPS / 写真URL を含む)
 *   3. project_cost_aggregates(時給 × 時間で人件費を加算)
 *   4. user_career_totals(累計時間 / 提出回数 / 最終提出日)
 *   5. gamification_events(提出ボーナス +10 XP)
 * + idempotency_log と audit_log への書き込みも RPC 内で完結。
 *
 * RPC 失敗時は Postgres 側でロールバックされ、二重反映は起こらない。
 */
export async function submitReport3(
  prev: Report3Result,
  formData: FormData,
): Promise<Report3Result> {
  void prev;

  const session = await requireSession();
  const supabase = await createClient();

  let rowsParsed: unknown;
  try {
    rowsParsed = JSON.parse(String(formData.get("rows") ?? "[]"));
  } catch {
    return { ok: false, formError: "入力データの形式が不正です。" };
  }

  const parsed = Report3InputSchema.safeParse({
    projectId: formData.get("projectId"),
    workDate: formData.get("workDate"),
    rows: rowsParsed,
    idempotencyKey: formData.get("idempotencyKey"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const totalHours = parsed.data.rows.reduce((s, r) => s + r.hours, 0);
  const requiresApproval = totalHours > 8;

  const { data: entryId, error } = await supabase.rpc(
    "submit_report3_atomic",
    {
      p_user_id: session.userId,
      p_tenant_id: session.tenantId,
      p_project_id: parsed.data.projectId,
      p_work_date: parsed.data.workDate,
      p_rows: parsed.data.rows,
      p_idempotency_key: parsed.data.idempotencyKey,
      p_total_hours: totalHours,
      p_requires_approval: requiresApproval,
    },
  );

  if (error || !entryId) {
    return {
      ok: false,
      formError:
        error?.message ?? "保存に失敗しました。もう一度お試しください。",
    };
  }

  revalidatePath("/sp/home");
  revalidatePath("/pc/home");
  revalidatePath("/pc/reports");

  return { ok: true, reportId: entryId as string, deduped: false };
}
