import { isDatabaseConfigured, optionalEnv } from "@/lib/env";
import { storeMode } from "@/lib/waitlist/store";

export const dynamic = "force-dynamic";

/**
 * Deployment diagnostics. Never a value — only booleans, variable *names*, and
 * the public commit sha — so this is safe to leave up, though it can be deleted
 * once the environment is settled.
 */
export async function GET() {
  // Names only. A typo or a variable scoped to the wrong environment shows up
  // here immediately, without exposing a single character of any secret.
  const slackVarNames = Object.keys(process.env)
    .filter((key) => /slack/i.test(key))
    .sort();

  const body = {
    ok: true,
    commit: (optionalEnv("VERCEL_GIT_COMMIT_SHA") ?? "local").slice(0, 7),
    nodeEnv: process.env.NODE_ENV ?? null,
    vercelEnv: optionalEnv("VERCEL_ENV") ?? null,
    storeMode: storeMode(),
    databaseConfigured: isDatabaseConfigured(),
    slackConfigured: Boolean(optionalEnv("SLACK_WAITLIST_WEBHOOK_URL")),
    slackVarNames,
    appUrlConfigured: Boolean(optionalEnv("NEXT_PUBLIC_APP_URL")),
  };

  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
