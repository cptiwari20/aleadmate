import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { databaseUrl } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const url = databaseUrl();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. The public library renders from content/ without a " +
        "database, but anything touching accounts, forks, or submissions needs one.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: url }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

/**
 * Lazy on purpose: importing this module must not throw during `next build`
 * when no database is configured yet.
 */
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}
