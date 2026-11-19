/**
 * Env access is deliberately lazy and tolerant.
 *
 * Phase 0 renders the whole public site from version-controlled markdown, so a
 * missing DATABASE_URL must not break `next build`. Each consumer asserts only
 * what it actually needs, at the point it needs it.
 */

export function optionalEnv(key: string): string | undefined {
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
}

export function requireEnv(key: string): string {
  const value = optionalEnv(key);
  if (!value) {
    throw new Error(
      `Missing required environment variable ${key}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

/**
 * Values still carrying the .env.example placeholders count as unset.
 * Copying the example and filling in only some keys is the normal first move,
 * and a placeholder URL fails at connect time with a far more confusing error
 * than simply having no database configured.
 */
const PLACEHOLDER = /USER:PASSWORD|HOST\.neon\.tech|^your[-_]/i;

export const databaseUrl = () => {
  const url = optionalEnv("DATABASE_URL");
  return url && !PLACEHOLDER.test(url) ? url : undefined;
};
export const isDatabaseConfigured = () => Boolean(databaseUrl());
