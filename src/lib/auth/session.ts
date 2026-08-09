import { headers } from "next/headers";
import { isDatabaseConfigured } from "@/lib/env";
import { getAuth } from "@/lib/auth";

/**
 * Returns null rather than throwing when auth is not configured, so public
 * pages can render an anonymous view on a fresh checkout with no .env.
 */
export async function getSession() {
  if (!isDatabaseConfigured()) return null;

  try {
    return await getAuth().api.getSession({ headers: await headers() });
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}
