import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homeForRole } from "@/server/auth/session";
import type { UserRole } from "@/server/auth/session";

export default async function RootPage() {
  const supabase = await createClient();
  // Middleware already verified the session this request; use cheap getSession()
  // to avoid a second Supabase Auth round-trip.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    // 未ログインは /sign-in へ。1 クリックでロール別ログインできる
    // クイックログインボタンが用意されている。
    //
    // Note: Server Component(本ファイル)から signInWithPassword を呼んでも
    // Next.js 15 では cookies() が読み取り中心になっており auth cookie の
    // persist が安定しない(redirect loop の原因になる)ため、ログイン処理は
    // Server Action(quickSignIn)経由でのみ行う。
    redirect("/sign-in");
  }

  // Fetch role to send the user to the right home
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!profile) {
    redirect("/sign-in?error=profile_missing");
  }

  redirect(homeForRole(profile.role as UserRole));
}
