"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";
import { Report3InputSchema, type Report3Result } from "../schemas";

/**
 * REPORT3 submission Server Action.
 *
 * Phase B (current): saves to report3_entries + report3_rows + idempotency_log
 * + audit_log inside Postgres via the Supabase client. Multi-row inserts use
 * the same client, so they share connection but NOT a single transaction —
 * see ADR-0001 for the full atomic-fanout design that adds:
 *   - user_career_totals
 *   - project_cost_aggregates
 *   - gamification_events
 * which require a Postgres function (RPC) to wrap all 5 streams in a single
 * transaction. Phase B uses sequential inserts and accepts the (small)
 * race window — ADR-0001 will be implemented before Phase C.
 *
 * For now: idempotency check + sequential insert + audit log.
 */
export async function submitReport3(
  prev: Report3Result,
  formData: FormData,
): Promise<Report3Result> {
  void prev;

  const session = await requireSession();
  const supabase = await createClient();

  // Parse the form
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

  // Idempotency check
  const { data: existing } = await supabase
    .from("report3_idempotency_log")
    .select("entry_id")
    .eq("idempotency_key", parsed.data.idempotencyKey)
    .maybeSingle();

  if (existing) {
    return { ok: true, reportId: existing.entry_id, deduped: true };
  }

  const totalHours = parsed.data.rows.reduce((s, r) => s + r.hours, 0);
  const requiresLeaderApproval = totalHours > 8;

  // Insert REPORT3 entry
  const { data: entry, error: entryError } = await supabase
    .from("report3_entries")
    .insert({
      tenant_id: session.tenantId,
      user_id: session.userId,
      project_id: parsed.data.projectId,
      work_date: parsed.data.workDate,
      requires_leader_approval: requiresLeaderApproval,
    })
    .select("id")
    .single();

  if (entryError || !entry) {
    return {
      ok: false,
      formError: "保存に失敗しました。もう一度お試しください。",
    };
  }

  // Insert rows
  const { error: rowsError } = await supabase.from("report3_rows").insert(
    parsed.data.rows.map((r) => ({
      entry_id: entry.id,
      l1: r.l1,
      l2: r.l2,
      l3: r.l3,
      hours: r.hours,
      memo: r.memo || null,
    })),
  );

  if (rowsError) {
    // Rollback the entry to avoid orphan rows.
    await supabase.from("report3_entries").delete().eq("id", entry.id);
    return {
      ok: false,
      formError: "明細の保存に失敗しました。もう一度お試しください。",
    };
  }

  // Idempotency record
  await supabase.from("report3_idempotency_log").insert({
    idempotency_key: parsed.data.idempotencyKey,
    entry_id: entry.id,
    user_id: session.userId,
  });

  // Audit log
  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "report3.submitted",
    target_type: "report3_entry",
    target_id: entry.id,
    diff: { rows: parsed.data.rows, totalHours },
  });

  revalidatePath("/sp/home");

  return { ok: true, reportId: entry.id, deduped: false };
}
