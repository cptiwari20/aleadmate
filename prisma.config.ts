import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 keeps connection URLs here rather than in schema.prisma.
 *
 * CLI commands (`db push`, `migrate`, `studio`) want the *direct* Neon URL —
 * the pooled one drops the session state DDL needs. Runtime is separate and
 * goes through the Neon serverless adapter in src/lib/prisma.ts.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "tsx scripts/seed.ts",
  },
});
