"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";

const SchemaSI = z.object({
  projectId: z.string().uuid().optional().or(z.literal("")),
  invoiceType: z.enum(["material", "lease", "subcontractor", "misc"]),
  supplierName: z.string().trim().min(1).max(120),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  invoiceNumber: z.string().trim().max(60).optional().or(z.literal("")),
  amountYen: z.coerce.number().int().min(0).max(1_000_000_000),
  manhours: z.coerce.number().min(0).optional(),
  overtimeHours: z.coerce.number().min(0).optional(),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
});

export type SIActionResult =
  | { ok: true; id: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };

export async function createSupplierInvoice(
  prev: SIActionResult,
  formData: FormData,
): Promise<SIActionResult> {
  void prev;
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role))
    return { ok: false, formError: "請求書を入力する権限がありません。" };

  const parsed = SchemaSI.safeParse({
    projectId: formData.get("projectId") ?? "",
    invoiceType: formData.get("invoiceType") ?? "material",
    supplierName: formData.get("supplierName") ?? "",
    invoiceDate: formData.get("invoiceDate") ?? "",
    invoiceNumber: formData.get("invoiceNumber") ?? "",
    amountYen: formData.get("amountYen") ?? "0",
    manhours: formData.get("manhours") || undefined,
    overtimeHours: formData.get("overtimeHours") || undefined,
    note: formData.get("note") ?? "",
    attachmentUrl: formData.get("attachmentUrl") ?? "",
  });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const sb = await createClient();
  const { data, error } = await sb
    .from("supplier_invoices")
    .insert({
      tenant_id: session.tenantId,
      project_id: parsed.data.projectId || null,
      invoice_type: parsed.data.invoiceType,
      supplier_name: parsed.data.supplierName,
      invoice_date: parsed.data.invoiceDate,
      invoice_number: parsed.data.invoiceNumber || null,
      amount_yen: parsed.data.amountYen,
      manhours: parsed.data.manhours ?? null,
      overtime_hours: parsed.data.overtimeHours ?? null,
      note: parsed.data.note || null,
      attachment_url: parsed.data.attachmentUrl || null,
      entered_by: session.userId,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, formError: error?.message ?? "保存に失敗しました。" };

  await sb.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "supplier_invoice.created",
    target_type: "supplier_invoice",
    target_id: data.id,
    diff: {
      type: parsed.data.invoiceType,
      supplier: parsed.data.supplierName,
      amount: parsed.data.amountYen,
    },
  });

  revalidatePath("/pc/supplier-invoices");
  redirect("/pc/supplier-invoices");
}
