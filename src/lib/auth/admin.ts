import "server-only";
import { optionalEnv } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Admin access is an allowlist in the environment, not a database flag.
 * A role column is one compromised signup away from being set by the wrong
 * person; an env var can only be changed by whoever can deploy.
 */
export function adminEmails(): string[] {
  return (optionalEnv("ADMIN_EMAILS") ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin(): Promise<
  { ok: true; email: string } | { ok: false; reason: "signed-out" | "not-admin" | "unconfigured" }
> {
  const allowed = adminEmails();
  if (allowed.length === 0) return { ok: false, reason: "unconfigured" };

  const user = await getCurrentUser();
  if (!user?.email) return { ok: false, reason: "signed-out" };

  if (!allowed.includes(user.email.toLowerCase())) {
    return { ok: false, reason: "not-admin" };
  }

  return { ok: true, email: user.email };
}
