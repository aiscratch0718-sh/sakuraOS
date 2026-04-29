import { z } from "zod";

export const ItemInputSchema = z.object({
  name: z.string().trim().min(1, "品名は必須です。").max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  quantity: z.coerce.number().min(0).max(100_000_000),
  unit: z.string().trim().max(20).optional().or(z.literal("")),
  unitPriceYen: z.coerce.number().int().min(0).max(1_000_000_000),
});
export type ItemInput = z.infer<typeof ItemInputSchema>;

export const EstimateStatusValues = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
] as const;

// 印鑑選択(stamp_key → boolean のマップ。例: { company: true, president: false })
export const StampsSchema = z.record(z.string(), z.boolean()).default({});
export type StampsSelection = z.infer<typeof StampsSchema>;

export const PrintOptionsSchema = z.object({
  printCompanyStamp: z.coerce.boolean().default(true),
  printStaffInfo: z.coerce.boolean().default(true),
  printCompanyContact: z.coerce.boolean().default(true),
});
export type PrintOptions = z.infer<typeof PrintOptionsSchema>;

export const EstimateInputSchema = z.object({
  customerId: z.string().uuid("客先を選択してください。"),
  projectId: z.string().uuid().optional().or(z.literal("")),
  estimateNo: z.string().trim().max(40).optional().or(z.literal("")),
  title: z.string().trim().min(1, "件名は必須です。").max(120),
  status: z.enum(EstimateStatusValues).default("draft"),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "発行日が不正です。"),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "有効期限が不正です。")
    .optional()
    .or(z.literal("")),
  taxRate: z.coerce.number().min(0).max(1).default(0.1),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  items: z.array(ItemInputSchema).min(1, "明細を1行以上入力してください。").max(50),
  stamps: StampsSchema,
  printCompanyStamp: z.coerce.boolean().default(true),
  printStaffInfo: z.coerce.boolean().default(true),
  printCompanyContact: z.coerce.boolean().default(true),
});
export type EstimateInput = z.infer<typeof EstimateInputSchema>;

export const InvoiceStatusValues = [
  "draft",
  "issued",
  "paid",
  "overdue",
  "voided",
] as const;

export const InvoiceInputSchema = z.object({
  customerId: z.string().uuid("客先を選択してください。"),
  projectId: z.string().uuid().optional().or(z.literal("")),
  estimateId: z.string().uuid().optional().or(z.literal("")),
  invoiceNo: z.string().trim().max(40).optional().or(z.literal("")),
  title: z.string().trim().min(1, "件名は必須です。").max(120),
  status: z.enum(InvoiceStatusValues).default("draft"),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "発行日が不正です。"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "支払期限が不正です。")
    .optional()
    .or(z.literal("")),
  taxRate: z.coerce.number().min(0).max(1).default(0.1),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  items: z.array(ItemInputSchema).min(1, "明細を1行以上入力してください。").max(50),
  stamps: StampsSchema,
  printCompanyStamp: z.coerce.boolean().default(true),
  printStaffInfo: z.coerce.boolean().default(true),
  printCompanyContact: z.coerce.boolean().default(true),
});
export type InvoiceInput = z.infer<typeof InvoiceInputSchema>;

export type BillingActionResult =
  | { ok: true; id: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };

/**
 * 明細から小計・消費税・合計(全て銭)を計算する。
 * 品目の数量×単価(円)を合計し、税率を適用。
 */
export function computeTotals(
  items: ItemInput[],
  taxRate: number,
): { subtotalCents: number; taxCents: number; totalCents: number } {
  const subtotalYen = items.reduce(
    (s, it) => s + it.quantity * it.unitPriceYen,
    0,
  );
  const subtotalCents = Math.round(subtotalYen * 100);
  const taxCents = Math.round(subtotalCents * taxRate);
  return {
    subtotalCents,
    taxCents,
    totalCents: subtotalCents + taxCents,
  };
}
