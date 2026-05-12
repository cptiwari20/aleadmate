import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "@/lib/env";

let prisma: PrismaClient | null = null;

export function getPrisma() {
  if (!prisma) {
    const pool = new Pool({ connectionString: getDatabaseUrl() });
    const adapter = new PrismaNeon(pool);
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
}
