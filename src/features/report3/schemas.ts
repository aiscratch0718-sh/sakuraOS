import { z } from "zod";

export const Report3RowSchema = z.object({
  l1: z.string().min(1),
  l2: z.string().min(1),
  l3: z.string().min(1),
  hours: z.number().min(0.5).max(24).step(0.5),
  memo: z.string().max(500).optional().or(z.literal("")),
  // GPS / 写真(任意)
  photo_url: z.string().url().optional().or(z.literal("")),
  photo_lat: z
    .number()
    .min(-90)
    .max(90)
    .optional()
    .or(z.literal("")),
  photo_lng: z
    .number()
    .min(-180)
    .max(180)
    .optional()
    .or(z.literal("")),
  photo_taken_at: z.string().datetime().optional().or(z.literal("")),
});
export type Report3Row = z.infer<typeof Report3RowSchema>;

export const Report3InputSchema = z.object({
  projectId: z.string().uuid(),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  rows: z.array(Report3RowSchema).min(1).max(10),
  idempotencyKey: z.string().min(1),
});
export type Report3Input = z.infer<typeof Report3InputSchema>;

export type Report3Result =
  | { ok: true; reportId: string; deduped: boolean }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };
