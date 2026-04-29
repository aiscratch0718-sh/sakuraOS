"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";

const IncidentInputSchema = z.object({
  projectId: z.string().uuid().optional().or(z.literal("")),
  occurredAt: z.string().min(1),
  severity: z.enum(["low", "medium", "high", "critical"]),
  category: z.string().trim().max(40).optional().or(z.literal("")),
  whatHappened: z.string().trim().min(1).max(2000),
  whyHappened: z.string().trim().max(2000).optional().or(z.literal("")),
  countermeasure: z.string().trim().max(2000).optional().or(z.literal("")),
  photoUrl: z.string().url().optional().or(z.literal("")),
  photoLat: z.coerce.number().optional(),
  photoLng: z.coerce.number().optional(),
});

const ResolveSchema = z.object({
  status: z.enum(["resolved", "dismissed", "open"]),
  resolutionNote: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type IncidentActionResult =
  | { ok: true; id: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };

export async function createIncident(
  prev: IncidentActionResult,
  formData: FormData,
): Promise<IncidentActionResult> {
  void prev;
  const session = await requireSession();
  const supabase = await createClient();

  const parsed = IncidentInputSchema.safeParse({
    projectId: formData.get("projectId") ?? "",
    occurredAt: formData.get("occurredAt") ?? "",
    severity: formData.get("severity") ?? "medium",
    category: formData.get("category") ?? "",
    whatHappened: formData.get("whatHappened") ?? "",
    whyHappened: formData.get("whyHappened") ?? "",
    countermeasure: formData.get("countermeasure") ?? "",
    photoUrl: formData.get("photoUrl") ?? "",
    photoLat: formData.get("photoLat") || undefined,
    photoLng: formData.get("photoLng") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("incident_reports")
    .insert({
      tenant_id: session.tenantId,
      reporter_id: session.userId,
      project_id: parsed.data.projectId || null,
      occurred_at: parsed.data.occurredAt,
      severity: parsed.data.severity,
      category: parsed.data.category || null,
      what_happened: parsed.data.whatHappened,
      why_happened: parsed.data.whyHappened || null,
      countermeasure: parsed.data.countermeasure || null,
      photo_url: parsed.data.photoUrl || null,
      photo_lat: parsed.data.photoLat ?? null,
      photo_lng: parsed.data.photoLng ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, formError: error?.message ?? "保存に失敗しました。" };
  }

  // ゲーミフィ: ヒヤリハット報告 = +30 XP
  await supabase.from("gamification_events").insert({
    tenant_id: session.tenantId,
    user_id: session.userId,
    event_type: "incident.reported",
    xp_delta: 30,
    source_type: "incident_report",
    source_id: data.id,
  });

  // 監査ログ
  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "incident.reported",
    target_type: "incident_report",
    target_id: data.id,
    diff: { severity: parsed.data.severity, category: parsed.data.category },
  });

  // 通知: 全 office/ceo へ知らせる
  const { data: managers } = await supabase
    .from("profiles")
    .select("id")
    .in("role", ["office", "ceo", "system"])
    .eq("tenant_id", session.tenantId);

  if (managers && managers.length > 0) {
    const sevLabel: Record<string, string> = {
      low: "低",
      medium: "中",
      high: "高",
      critical: "緊急",
    };
    await supabase.from("notifications").insert(
      managers.map((m) => ({
        tenant_id: session.tenantId,
        user_id: m.id,
        category: "incident",
        title: `⚠ ヒヤリハット報告(${sevLabel[parsed.data.severity] ?? "?"})`,
        body: parsed.data.whatHappened.slice(0, 100),
        link_url: `/pc/incidents/${data.id}`,
      })),
    );
  }

  revalidatePath("/pc/incidents");
  revalidatePath("/sp/incidents");
  redirect("/sp/incidents");
}

export async function resolveIncident(
  incidentId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  if (!["leader", "office", "ceo", "system"].includes(session.role)) {
    return { ok: false, error: "対応権限がありません。" };
  }

  const parsed = ResolveSchema.safeParse({
    status: formData.get("status") ?? "resolved",
    resolutionNote: formData.get("resolutionNote") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力エラー" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("incident_reports")
    .update({
      status: parsed.data.status,
      resolved_at: parsed.data.status === "open" ? null : new Date().toISOString(),
      resolved_by: parsed.data.status === "open" ? null : session.userId,
      resolution_note: parsed.data.resolutionNote || null,
    })
    .eq("id", incidentId);

  if (error) return { ok: false, error: error.message };

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: `incident.${parsed.data.status}`,
    target_type: "incident_report",
    target_id: incidentId,
    diff: { status: parsed.data.status },
  });

  revalidatePath("/pc/incidents");
  revalidatePath("/sp/incidents");
  return { ok: true };
}
