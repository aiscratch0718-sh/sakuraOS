"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";

const PriceItemInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().max(40).optional().or(z.literal("")),
  unit: z.string().trim().min(1).max(20),
  standardPriceYen: z.coerce.number().int().min(0).max(1_000_000_000),
  minPriceYen: z.coerce.number().int().min(0).optional(),
  maxPriceYen: z.coerce.number().int().min(0).optional(),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export type PriceItemActionResult =
  | { ok: true; id: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };

function ensureMaster(role: string) {
  if (!["office", "ceo", "system"].includes(role))
    return "単価マスタを編集する権限がありません。";
  return null;
}

export async function createPriceItem(
  prev: PriceItemActionResult,
  formData: FormData,
): Promise<PriceItemActionResult> {
  void prev;
  const session = await requireSession();
  const roleError = ensureMaster(session.role);
  if (roleError) return { ok: false, formError: roleError };

  const parsed = PriceItemInputSchema.safeParse({
    name: formData.get("name") ?? "",
    category: formData.get("category") ?? "",
    unit: formData.get("unit") ?? "式",
    standardPriceYen: formData.get("standardPriceYen") ?? "0",
    minPriceYen: formData.get("minPriceYen") || undefined,
    maxPriceYen: formData.get("maxPriceYen") || undefined,
    note: formData.get("note") ?? "",
  });
  if (!parsed.success)
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("price_items")
    .insert({
      tenant_id: session.tenantId,
      name: parsed.data.name,
      category: parsed.data.category || null,
      unit: parsed.data.unit,
      standard_price_yen: parsed.data.standardPriceYen,
      min_price_yen: parsed.data.minPriceYen ?? null,
      max_price_yen: parsed.data.maxPriceYen ?? null,
      note: parsed.data.note || null,
    })
    .select("id")
    .single();
  if (error || !data)
    return {
      ok: false,
      formError:
        error?.code === "23505"
          ? "同名の単価項目が既にあります。"
          : (error?.message ?? "保存に失敗しました。"),
    };

  await supabase.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "price_item.created",
    target_type: "price_item",
    target_id: data.id,
    diff: { name: parsed.data.name, standardPriceYen: parsed.data.standardPriceYen },
  });

  revalidatePath("/pc/price-items");
  redirect("/pc/price-items");
}
