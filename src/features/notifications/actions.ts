"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/server/auth/session";

export async function markNotificationRead(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", session.userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/sp/notifications");
  revalidatePath("/pc/notifications");
  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await requireSession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", session.userId)
    .is("read_at", null);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/sp/notifications");
  revalidatePath("/pc/notifications");
  return { ok: true };
}
