import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "@/lib/env";

let prisma: PrismaClient | null = null;

export function getPrisma() {
  if (!prisma) {
    const adapter = new PrismaNeon({ connectionString: getDatabaseUrl() });
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
}
