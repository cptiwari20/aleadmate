import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  DIRECT_DATABASE_URL: z.string().url().optional(),
  DATABASE_POSTGRES_PRISMA_URL: z.string().url().optional(),
  DATABASE_POSTGRES_URL: z.string().url().optional(),
  DATABASE_POSTGRES_URL_NON_POOLING: z.string().url().optional(),
  DATABASE_URL_UNPOOLED: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default("openai/gpt-4o-mini"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_ID_SYNC_MONTHLY: z.string().optional(),
});

export function getServerEnv() {
  return serverEnvSchema.parse(process.env);
}

export function getDatabaseUrl() {
  const env = getServerEnv();
  const databaseUrl =
    env.DATABASE_URL ??
    env.DATABASE_POSTGRES_PRISMA_URL ??
    env.DATABASE_POSTGRES_URL ??
    env.DATABASE_POSTGRES_URL_NON_POOLING ??
    env.DATABASE_URL_UNPOOLED;

  if (!databaseUrl) {
    throw new Error("A Neon/Postgres connection URL is required. Set DATABASE_URL or DATABASE_POSTGRES_PRISMA_URL.");
  }

  return databaseUrl;
}
