"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";

export const RECEIPT_CATEGORIES = [
  "消耗品",
  "食事代",
  "交通費",
  "宿泊費",
  "駐車料金",
  "その他",
] as const;

export const RECEIPT_SUBCATEGORIES: Record<string, string[]> = {
  消耗品: ["事務用品", "材料", "その他"],
  食事代: ["接待交際費", "福利厚生費"],
  交通費: ["ガソリン", "高速料金", "電車・バス", "タクシー", "その他"],
  宿泊費: ["レオパレス", "ホテル", "その他"],
  駐車料金: [],
  その他: [],
};

const ReceiptSchema = z.object({
  projectId: z.string().uuid().optional().or(z.literal("")),
  receiptDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amountYen: z.coerce.number().int().min(0).max(100_000_000),
  category: z.enum(RECEIPT_CATEGORIES),
  subcategory: z.string().trim().max(40).optional().or(z.literal("")),
  paymentMethod: z.enum(["company_card", "personal_advance"]),
  needsReimbursement: z.coerce.boolean().default(false),
  companions: z.string().trim().max(200).optional().or(z.literal("")),
  mealType: z.enum(["business_entertainment", "welfare"]).optional().or(z.literal("")),
  photoUrl: z.string().url().optional().or(z.literal("")),
  note: z.string().max(500).optional().or(z.literal("")),
});

export type ReceiptActionResult =
  | { ok: true; id: string; warning?: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[] | undefined> };

/**
 * 領収書を提出する。
 *
 * バリデーション:
 * - 申請月と領収月の差が 1 ヶ月以上 → 警告(ok: true + warning)
 * - 年度跨ぎ → エラー(ok: false)
 *
 * 個人立替の場合(paymentMethod=personal_advance + needsReimbursement)は
 * 自動で reimbursement_status='requested' を設定。
 */
export async function submitReceipt(
  prev: ReceiptActionResult,
  formData: FormData,
): Promise<ReceiptActionResult> {
  void prev;
  const session = await requireSession();

  const parsed = ReceiptSchema.safeParse({
    projectId: formData.get("projectId") ?? "",
    receiptDate: formData.get("receiptDate") ?? "",
    amountYen: formData.get("amountYen") ?? "0",
    category: formData.get("category") ?? "その他",
    subcategory: formData.get("subcategory") ?? "",
    paymentMethod: formData.get("paymentMethod") ?? "company_card",
    needsReimbursement: formData.get("needsReimbursement") === "on",
    companions: formData.get("companions") ?? "",
    mealType: formData.get("mealType") ?? "",
    photoUrl: formData.get("photoUrl") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // 年度跨ぎチェック(4月始まり)
  const today = new Date();
  const todayFY = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  const rcpt = new Date(parsed.data.receiptDate);
  const rcptFY = rcpt.getMonth() >= 3 ? rcpt.getFullYear() : rcpt.getFullYear() - 1;
  if (rcptFY !== todayFY) {
    return { ok: false, formError: "前年度以前の領収書は申請できません。" };
  }

  // 月差警告
  const monthDiff =
    (today.getFullYear() - rcpt.getFullYear()) * 12 + (today.getMonth() - rcpt.getMonth());
  let warning: string | undefined;
  if (monthDiff > 1) {
    warning = `領収月から ${monthDiff} ヶ月経過しています。経理処理が遅れている可能性があります。`;
  }

  const sb = await createClient();
  const { data, error } = await sb
    .from("receipts")
    .insert({
      tenant_id: session.tenantId,
      user_id: session.userId,
      project_id: parsed.data.projectId || null,
      receipt_date: parsed.data.receiptDate,
      amount_yen: parsed.data.amountYen,
      category: parsed.data.category,
      subcategory: parsed.data.subcategory || null,
      payment_method: parsed.data.paymentMethod,
      needs_reimbursement:
        parsed.data.paymentMethod === "personal_advance" && parsed.data.needsReimbursement,
      reimbursement_status:
        parsed.data.paymentMethod === "personal_advance" && parsed.data.needsReimbursement
          ? "requested"
          : null,
      companions: parsed.data.companions || null,
      meal_type: parsed.data.mealType || null,
      photo_url: parsed.data.photoUrl || null,
      note: parsed.data.note || null,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, formError: error?.message ?? "保存に失敗しました。" };

  // 総務課への通知
  const { data: officeUsers } = await sb
    .from("profiles")
    .select("id")
    .or("is_general_affairs_member.eq.true,role.in.(office,ceo,system)")
    .eq("tenant_id", session.tenantId);
  if (officeUsers && officeUsers.length > 0) {
    await sb.from("notifications").insert(
      officeUsers.map((u) => ({
        tenant_id: session.tenantId,
        user_id: u.id,
        category: "approval",
        title: `🧾 領収書提出あり(${parsed.data.category} ¥${parsed.data.amountYen.toLocaleString("ja-JP")})`,
        body: `${parsed.data.receiptDate} の領収書が提出されました。${parsed.data.needsReimbursement ? "【精算申請あり】" : ""}`,
        link_url: `/pc/receipts`,
      })),
    );
  }

  // 監査ログ
  await sb.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "receipt.submitted",
    target_type: "receipt",
    target_id: data.id,
    diff: {
      amount: parsed.data.amountYen,
      category: parsed.data.category,
      paymentMethod: parsed.data.paymentMethod,
      reimbursement: parsed.data.needsReimbursement,
    },
  });

  revalidatePath("/sp/receipts");
  revalidatePath("/pc/receipts");
  redirect(warning ? `/sp/receipts?warning=${encodeURIComponent(warning)}` : "/sp/receipts");
}

export async function approveReceipt(
  receiptId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  void formData;
  const session = await requireSession();
  if (!["office", "ceo", "system"].includes(session.role))
    return { ok: false, error: "承認権限がありません。" };

  const sb = await createClient();
  const { error } = await sb
    .from("receipts")
    .update({ reviewed_by: session.userId, reviewed_at: new Date().toISOString() })
    .eq("id", receiptId);
  if (error) return { ok: false, error: error.message };

  await sb.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "receipt.reviewed",
    target_type: "receipt",
    target_id: receiptId,
  });

  revalidatePath("/pc/receipts");
  return { ok: true };
}

export async function markReimbursementPaid(
  receiptId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  if (!session.role || !["office", "ceo", "system"].includes(session.role))
    return { ok: false, error: "権限がありません。" };

  const sb = await createClient();
  const { data: rcpt } = await sb
    .from("receipts")
    .select("user_id, amount_yen, category")
    .eq("id", receiptId)
    .maybeSingle();

  const { error } = await sb
    .from("receipts")
    .update({ reimbursement_status: "paid", reimbursement_paid_at: new Date().toISOString() })
    .eq("id", receiptId);
  if (error) return { ok: false, error: error.message };

  // 経理課への通知(お金の動き)
  const { data: acctUsers } = await sb
    .from("profiles")
    .select("id")
    .eq("is_accounting_member", true)
    .eq("tenant_id", session.tenantId);
  if (acctUsers && acctUsers.length > 0 && rcpt) {
    await sb.from("notifications").insert(
      acctUsers.map((u) => ({
        tenant_id: session.tenantId,
        user_id: u.id,
        category: "coin",
        title: `💴 精算実行(${rcpt.category} ¥${Number(rcpt.amount_yen).toLocaleString("ja-JP")})`,
        body: `領収書 ${receiptId.slice(0, 8)} の精算が完了しました。`,
        link_url: `/pc/receipts`,
      })),
    );
  }

  await sb.from("audit_log").insert({
    tenant_id: session.tenantId,
    actor_id: session.userId,
    action: "receipt.reimbursement_paid",
    target_type: "receipt",
    target_id: receiptId,
  });

  revalidatePath("/pc/receipts");
  return { ok: true };
}
