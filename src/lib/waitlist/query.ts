import "server-only";
import { isDatabaseConfigured } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

export type SignupRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  leadTypes: string[];
  leadTypeOther: string | null;
  location: string | null;
  business: string | null;
  budgetPerLead: string | null;
  leadsPerMonth: string | null;
  stage: "CONTACT" | "QUALIFIED";
  createdAt: Date;
};

export type WaitlistSummary = {
  total: number;
  qualified: number;
  last7Days: number;
};

export async function listSignups(limit = 500): Promise<SignupRow[]> {
  if (!isDatabaseConfigured()) return [];

  return getPrisma().waitlistSignup.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      leadTypes: true,
      leadTypeOther: true,
      location: true,
      business: true,
      budgetPerLead: true,
      leadsPerMonth: true,
      stage: true,
      createdAt: true,
    },
  });
}

export async function summarise(): Promise<WaitlistSummary> {
  if (!isDatabaseConfigured()) return { total: 0, qualified: 0, last7Days: 0 };

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const prisma = getPrisma();

  const [total, qualified, last7Days] = await Promise.all([
    prisma.waitlistSignup.count(),
    prisma.waitlistSignup.count({ where: { stage: "QUALIFIED" } }),
    prisma.waitlistSignup.count({ where: { createdAt: { gte: since } } }),
  ]);

  return { total, qualified, last7Days };
}
