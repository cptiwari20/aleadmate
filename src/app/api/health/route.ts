import { isDatabaseConfigured, optionalEnv } from "@/lib/env";
import { storeMode } from "@/lib/waitlist/store";

export const dynamic = "force-dynamic";

/**
 * Deployment diagnostics. Booleans only — never a value, a host, or a
 * credential — so this is safe to leave public, though it can be deleted once
 * the environment is settled.
 */
export async function GET() {
  const body = {
    ok: true,
    nodeEnv: process.env.NODE_ENV ?? null,
    storeMode: storeMode(),
    databaseConfigured: isDatabaseConfigured(),
    slackConfigured: Boolean(optionalEnv("SLACK_WAITLIST_WEBHOOK_URL")),
    appUrlConfigured: Boolean(optionalEnv("NEXT_PUBLIC_APP_URL")),
  };

  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
