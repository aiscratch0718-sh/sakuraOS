"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";

const ToolInputSchema = z.object({
  toolCode: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().max(40).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export type ToolActionResult =
  | { ok: true; id: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };

function ensureMaster(role: string): string | null {
  if (!["office", "ceo", "system"].includes(role)) {
    return "工具マスタを編集する権限がありません。";
  }
  return null;
}

function genToken(): string {
  // 短めのランダムトークン(URL safe)
  return [...crypto.getRandomValues(new Uint8Array(12))]
    .map((b) => b.toString(36))
    .join("")
    .slice(0, 16);
}

export async function createTool(
  prev: ToolActionResult,
  formData: FormData,
): Promise<ToolActionResult> {
  void prev;
  const session = await requireSession();
  const roleError = ensureMaster(session.role);
  if (roleError) return { ok: false, formError: roleError };

  const parsed = ToolInputSchema.safeParse({
    toolCode: formData.get("toolCode") ?? "",
    name: formData.get("name") ?? "",
    category: formData.get("category") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tools")
    .insert({
      tenant_id: session.tenantId,
      tool_code: parsed.data.toolCode,
      name: parsed.data.name,
      category: parsed.data.category || null,
      note: parsed.data.note || null,
      qr_token: genToken(),
      status: "in_warehouse",
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      formError:
        error?.code === "23505"
          ? "工具コードが他の工具と重複しています。"
          : (error?.message ?? "保存に失敗しました。"),
    };
  }

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "tool.created",
    target_type: "tool",
    target_id: data.id,
    diff: { name: parsed.data.name },
  });

  revalidatePath("/pc/tools");
  redirect("/pc/tools");
}

/**
 * 工具持出(チェックアウト)。誰でも実行可能。
 * GPS と現場(任意)も同時に保存。
 */
export async function checkoutTool(
  toolId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const supabase = await createClient();

  const projectId = (formData.get("projectId") as string) || null;
  const lat = formData.get("lat");
  const lng = formData.get("lng");

  // 既に持出中ならエラー
  const { data: tool } = await supabase
    .from("tools")
    .select("id, status, tenant_id")
    .eq("id", toolId)
    .maybeSingle();
  if (!tool) return { ok: false, error: "工具が見つかりません。" };
  if (tool.tenant_id !== session.tenantId)
    return { ok: false, error: "他テナントの工具は操作できません。" };
  if (tool.status === "checked_out")
    return { ok: false, error: "すでに持出中の工具です。" };

  // checkout レコード作成
  const { error: coError } = await supabase.from("tool_checkouts").insert({
    tenant_id: session.tenantId,
    tool_id: toolId,
    user_id: session.userId,
    project_id: projectId,
    checkout_lat: lat ? Number(lat) : null,
    checkout_lng: lng ? Number(lng) : null,
  });
  if (coError) return { ok: false, error: coError.message };

  // tool 自体を update
  await supabase
    .from("tools")
    .update({
      status: "checked_out",
      current_user_id: session.userId,
      current_project_id: projectId,
      current_lat: lat ? Number(lat) : null,
      current_lng: lng ? Number(lng) : null,
    })
    .eq("id", toolId);

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "tool.checkout",
    target_type: "tool",
    target_id: toolId,
    diff: { projectId, lat, lng },
  });

  revalidatePath("/pc/tools");
  revalidatePath("/sp/tools");
  return { ok: true };
}

/**
 * 工具返却。
 */
export async function returnTool(
  toolId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const supabase = await createClient();

  const lat = formData.get("lat");
  const lng = formData.get("lng");

  // 自分が持出中の checkout を探す(office/ceo は他人のも返せる)
  const allowAny = ["office", "ceo", "system"].includes(session.role);
  let openQuery = supabase
    .from("tool_checkouts")
    .select("id, user_id")
    .eq("tool_id", toolId)
    .is("returned_at", null)
    .order("checked_out_at", { ascending: false })
    .limit(1);
  if (!allowAny) openQuery = openQuery.eq("user_id", session.userId);

  const { data: openCheckout } = await openQuery.maybeSingle();
  if (!openCheckout) {
    return { ok: false, error: "返却対象の持出記録が見つかりません。" };
  }

  await supabase
    .from("tool_checkouts")
    .update({
      returned_at: new Date().toISOString(),
      return_lat: lat ? Number(lat) : null,
      return_lng: lng ? Number(lng) : null,
    })
    .eq("id", openCheckout.id);

  await supabase
    .from("tools")
    .update({
      status: "in_warehouse",
      current_user_id: null,
      current_project_id: null,
      current_lat: lat ? Number(lat) : null,
      current_lng: lng ? Number(lng) : null,
    })
    .eq("id", toolId);

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "tool.return",
    target_type: "tool",
    target_id: toolId,
    diff: { lat, lng },
  });

  revalidatePath("/pc/tools");
  revalidatePath("/sp/tools");
  return { ok: true };
}
