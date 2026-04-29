import { z } from "zod";

const RoleEnum = z.enum(["worker", "leader", "office", "ceo"]);

export const CreateUserInputSchema = z.object({
  email: z.string().trim().email("メールアドレスが正しくありません。").max(120),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください。")
    .max(72),
  displayName: z.string().trim().min(1, "表示名は必須です。").max(80),
  role: RoleEnum,
  hourlyRateYen: z.coerce.number().int().min(0).max(100_000).optional(),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

export const UpdateUserInputSchema = z.object({
  displayName: z.string().trim().min(1, "表示名は必須です。").max(80),
  role: RoleEnum,
  hourlyRateYen: z.coerce.number().int().min(0).max(100_000).optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;

export type UserActionResult =
  | { ok: true; userId: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };
