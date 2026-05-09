"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";

const DeptSchema = z.object({
  name: z.string().trim().min(1).max(80),
  parentId: z.string().uuid().optional().or(z.literal("")),
  isVisibleToAll: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

const PosSchema = z.object({
  name: z.string().trim().min(1).max(80),
  rank: z.coerce.number().int().min(0).default(0),
  isVisibleToAll: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type OrgActionResult =
  | { ok: true; id: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };

function ensureMaster(role: string) {
  if (!["office", "ceo", "system"].includes(role)) return "ORG マスタを編集する権限がありません。";
  return null;
}

export async function createDepartment(
  prev: OrgActionResult,
  formData: FormData,
): Promise<OrgActionResult> {
  void prev;
  const session = await requireSession();
  const err = ensureMaster(session.role);
  if (err) return { ok: false, formError: err };

  const parsed = DeptSchema.safeParse({
    name: formData.get("name") ?? "",
    parentId: formData.get("parentId") ?? "",
    isVisibleToAll: formData.get("isVisibleToAll") === "on",
    sortOrder: formData.get("sortOrder") ?? "0",
  });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const sb = await createClient();
  const { data, error } = await sb
    .from("org_departments")
    .insert({
      tenant_id: session.tenantId,
      name: parsed.data.name,
      parent_id: parsed.data.parentId || null,
      is_visible_to_all: parsed.data.isVisibleToAll,
      sort_order: parsed.data.sortOrder,
    })
    .select("id")
    .single();
  if (error || !data)
    return {
      ok: false,
      formError:
        error?.code === "23505" ? "同名の部署が既にあります。" : (error?.message ?? "保存に失敗しました。"),
    };

  await sb.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "org_department.created",
    target_type: "org_department",
    target_id: data.id,
    diff: { name: parsed.data.name },
  });
  revalidatePath("/pc/org-departments");
  redirect("/pc/org-departments");
}

export async function createPosition(
  prev: OrgActionResult,
  formData: FormData,
): Promise<OrgActionResult> {
  void prev;
  const session = await requireSession();
  const err = ensureMaster(session.role);
  if (err) return { ok: false, formError: err };

  const parsed = PosSchema.safeParse({
    name: formData.get("name") ?? "",
    rank: formData.get("rank") ?? "0",
    isVisibleToAll: formData.get("isVisibleToAll") === "on",
    sortOrder: formData.get("sortOrder") ?? "0",
  });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const sb = await createClient();
  const { data, error } = await sb
    .from("org_positions")
    .insert({
      tenant_id: session.tenantId,
      name: parsed.data.name,
      rank: parsed.data.rank,
      is_visible_to_all: parsed.data.isVisibleToAll,
      sort_order: parsed.data.sortOrder,
    })
    .select("id")
    .single();
  if (error || !data)
    return {
      ok: false,
      formError:
        error?.code === "23505" ? "同名の役職が既にあります。" : (error?.message ?? "保存に失敗しました。"),
    };

  await sb.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "org_position.created",
    target_type: "org_position",
    target_id: data.id,
    diff: { name: parsed.data.name },
  });
  revalidatePath("/pc/org-positions");
  redirect("/pc/org-positions");
}

const HistorySchema = z.object({
  userId: z.string().uuid(),
  departmentId: z.string().uuid().optional().or(z.literal("")),
  positionId: z.string().uuid().optional().or(z.literal("")),
  startYearMonth: z.string().regex(/^\d{4}-\d{2}$/),
  endYearMonth: z.string().regex(/^\d{4}-\d{2}$/).optional().or(z.literal("")),
  note: z.string().max(500).optional().or(z.literal("")),
});

export async function setUserOrg(
  prev: OrgActionResult,
  formData: FormData,
): Promise<OrgActionResult> {
  void prev;
  const session = await requireSession();
  const err = ensureMaster(session.role);
  if (err) return { ok: false, formError: err };

  const parsed = HistorySchema.safeParse({
    userId: formData.get("userId") ?? "",
    departmentId: formData.get("departmentId") ?? "",
    positionId: formData.get("positionId") ?? "",
    startYearMonth: formData.get("startYearMonth") ?? "",
    endYearMonth: formData.get("endYearMonth") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const sb = await createClient();
  // 過去の現在所属(end_year_month null)を、同じ user で閉じる
  await sb
    .from("user_org_history")
    .update({ end_year_month: parsed.data.startYearMonth })
    .eq("user_id", parsed.data.userId)
    .is("end_year_month", null);

  // 新しい履歴を追加
  const { data, error } = await sb
    .from("user_org_history")
    .insert({
      tenant_id: session.tenantId,
      user_id: parsed.data.userId,
      department_id: parsed.data.departmentId || null,
      position_id: parsed.data.positionId || null,
      start_year_month: parsed.data.startYearMonth,
      end_year_month: parsed.data.endYearMonth || null,
      note: parsed.data.note || null,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, formError: error?.message ?? "保存に失敗しました。" };

  // profile の現在所属も同期
  await sb
    .from("profiles")
    .update({
      department_id: parsed.data.departmentId || null,
      position_id: parsed.data.positionId || null,
    })
    .eq("id", parsed.data.userId);

  await sb.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "user_org_history.created",
    target_type: "user_org_history",
    target_id: data.id,
    diff: parsed.data,
  });

  revalidatePath(`/pc/users/${parsed.data.userId}`);
  return { ok: true, id: data.id };
}
