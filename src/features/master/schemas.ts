import { z } from "zod";

// =========================================
// 顧客(客先)マスタ
// =========================================
export const CustomerInputSchema = z.object({
  name: z.string().trim().min(1, "客先名は必須です。").max(120),
  contactPerson: z.string().trim().max(80).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .max(120)
    .email("メールアドレスの形式が正しくありません。")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true),
});
export type CustomerInput = z.infer<typeof CustomerInputSchema>;

export type CustomerActionResult =
  | { ok: true; customerId: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };

// =========================================
// 工事案件(現場)マスタ
// =========================================
export const ProjectStatusValues = ["active", "completed", "archived"] as const;

export const ProjectInputSchema = z.object({
  code: z.string().trim().max(40).optional().or(z.literal("")),
  name: z.string().trim().min(1, "現場名は必須です。").max(120),
  customerId: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(ProjectStatusValues).default("active"),
  startedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "開始日は YYYY-MM-DD 形式で入力してください。")
    .optional()
    .or(z.literal("")),
  endedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "終了日は YYYY-MM-DD 形式で入力してください。")
    .optional()
    .or(z.literal("")),
  contractAmountCents: z
    .union([z.coerce.number().int().min(0).max(1_000_000_000_000), z.literal("")])
    .optional(),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});
export type ProjectInput = z.infer<typeof ProjectInputSchema>;

export type ProjectActionResult =
  | { ok: true; projectId: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };
