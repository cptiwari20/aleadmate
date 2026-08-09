import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { optionalEnv, requireEnv } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { sendMagicLinkEmail } from "@/lib/auth/email";

/**
 * Auth lands in Phase 0 rather than later because publishing is open from day
 * one — there is no invite-gated window in which the library can run read-only.
 *
 * Magic link is the primary method: contributors arrive from a shared link with
 * no intent to manage a password, and every extra field costs conversions on
 * the fork loop.
 */
function createAuth() {
  const googleId = optionalEnv("GOOGLE_CLIENT_ID");
  const googleSecret = optionalEnv("GOOGLE_CLIENT_SECRET");

  return betterAuth({
    appName: "aLeadMate",
    baseURL: optionalEnv("BETTER_AUTH_URL") ?? optionalEnv("NEXT_PUBLIC_APP_URL"),
    secret: requireEnv("BETTER_AUTH_SECRET"),

    database: prismaAdapter(getPrisma(), { provider: "postgresql" }),

    // No password auth at all — nothing to phish, nothing to reset.
    emailAndPassword: { enabled: false },

    socialProviders:
      googleId && googleSecret
        ? { google: { clientId: googleId, clientSecret: googleSecret } }
        : {},

    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 60 * 5 },
    },

    plugins: [
      magicLink({
        expiresIn: 60 * 10,
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLinkEmail({ email, url });
        },
      }),
    ],
  });
}

// Inferring from the concrete factory keeps better-auth's generics intact —
// widening to ReturnType<typeof betterAuth> erases the plugin and option types.
let cached: ReturnType<typeof createAuth> | null = null;

export function getAuth(): ReturnType<typeof createAuth> {
  cached ??= createAuth();
  return cached;
}
