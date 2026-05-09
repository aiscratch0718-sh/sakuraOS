"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";

const HEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

const BrandingSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().regex(HEX, "色は #RRGGBB 形式で入力してください"),
  accentColor: z.string().regex(HEX),
  bgColor: z.string().regex(HEX),
  sidebarColor: z.string().regex(HEX),
});

export type BrandingActionResult =
  | { ok: true }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };

const DEFAULTS = {
  primaryColor: "#1a3a6a",
  accentColor: "#2568c8",
  bgColor: "#e8f0f8",
  sidebarColor: "#ffffff",
};

export async function updateBranding(
  prev: BrandingActionResult,
  formData: FormData,
): Promise<BrandingActionResult> {
  void prev;
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    return { ok: false, formError: "ブランディングを変更する権限がありません。" };
  }

  const parsed = BrandingSchema.safeParse({
    logoUrl: formData.get("logoUrl") ?? "",
    primaryColor: formData.get("primaryColor") ?? DEFAULTS.primaryColor,
    accentColor: formData.get("accentColor") ?? DEFAULTS.accentColor,
    bgColor: formData.get("bgColor") ?? DEFAULTS.bgColor,
    sidebarColor: formData.get("sidebarColor") ?? DEFAULTS.sidebarColor,
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const sb = await createClient();
  const { error } = await sb
    .from("tenants")
    .update({
      logo_url: parsed.data.logoUrl || null,
      primary_color: parsed.data.primaryColor,
      accent_color: parsed.data.accentColor,
      bg_color: parsed.data.bgColor,
      sidebar_color: parsed.data.sidebarColor,
    })
    .eq("id", session.tenantId);
  if (error) return { ok: false, formError: error.message };

  await sb.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "tenant.branding_updated",
    target_type: "tenant",
    target_id: session.tenantId,
    diff: parsed.data,
  });

  // 全画面にブランディングが反映されるので全パスを revalidate
  revalidatePath("/", "layout");

  return { ok: true };
}

export async function resetBranding(): Promise<BrandingActionResult> {
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role)) {
    return { ok: false, formError: "権限がありません。" };
  }

  const sb = await createClient();
  const { error } = await sb
    .from("tenants")
    .update({
      logo_url: null,
      primary_color: DEFAULTS.primaryColor,
      accent_color: DEFAULTS.accentColor,
      bg_color: DEFAULTS.bgColor,
      sidebar_color: DEFAULTS.sidebarColor,
    })
    .eq("id", session.tenantId);
  if (error) return { ok: false, formError: error.message };

  await sb.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "tenant.branding_reset",
    target_type: "tenant",
    target_id: session.tenantId,
  });

  revalidatePath("/", "layout");
  return { ok: true };
}
