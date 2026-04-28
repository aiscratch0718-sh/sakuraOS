import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "worker" | "leader" | "office" | "ceo" | "system";

export type SessionContext = {
  userId: string;
  email: string;
  tenantId: string;
  displayName: string;
  role: UserRole;
};

/**
 * Returns the verified session for the current request, including the user's
 * profile (role, tenantId). Redirects to /sign-in if unauthenticated or if the
 * profile row is missing.
 */
export async function requireSession(): Promise<SessionContext> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/sign-in");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("tenant_id, display_name, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    // Auth user exists but no profile row — first-time sign-in case.
    // Redirect to a dedicated screen (not built yet — for now show error).
    redirect("/sign-in?error=profile_missing");
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    tenantId: profile.tenant_id,
    displayName: profile.display_name,
    role: profile.role as UserRole,
  };
}

/**
 * Role-based home redirect. Each role has a default landing page.
 */
export function homeForRole(role: UserRole): string {
  switch (role) {
    case "worker":
      return "/sp/home";
    case "leader":
      return "/sp/home"; // Same mobile home; leader-specific actions surfaced inline
    case "office":
      return "/pc/home";
    case "ceo":
      return "/pc/home";
    case "system":
      return "/pc/home";
  }
}
