"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/sign-in?error=invalid_credentials");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/sign-in?error=invalid_credentials");
  }

  redirect("/");
}

/**
 * テスト用クイックログイン。ボタンを押すだけで指定ロールのテストユーザーとして
 * 即サインイン → ロール別ホームへリダイレクト。
 *
 * MVP / デモ運用中の利便性最優先。本番リリース前に削除またはフラグで無効化する。
 */
const TEST_USERS: Record<
  string,
  { email: string; password: string; label: string }
> = {
  system: {
    email: "dev@sakura-os.local",
    password: "Sakura2026!",
    label: "開発者(全画面)",
  },
  ceo: {
    email: "admin@sakura-os.local",
    password: "Sakura2026!",
    label: "経営層 (CEO)",
  },
  office: {
    email: "office@sakura-os.local",
    password: "Sakura2026!",
    label: "事務",
  },
  leader: {
    email: "leader@sakura-os.local",
    password: "Sakura2026!",
    label: "現場リーダー",
  },
  worker: {
    email: "worker@sakura-os.local",
    password: "Sakura2026!",
    label: "作業員",
  },
};

export async function quickSignIn(formData: FormData) {
  const role = String(formData.get("role") ?? "");
  const user = TEST_USERS[role];
  if (!user) {
    redirect("/sign-in?error=invalid_credentials");
  }

  const supabase = await createClient();
  // 既存のセッションがあっても、別ロールへ切り替えるために必ず先にサインアウト
  await supabase.auth.signOut();

  const { error } = await supabase.auth.signInWithPassword({
    email: user!.email,
    password: user!.password,
  });

  if (error) {
    redirect("/sign-in?error=invalid_credentials");
  }

  redirect("/");
}
