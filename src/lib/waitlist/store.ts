import "server-only";
import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isDatabaseConfigured } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import type { ContactStep, QualifyStep } from "@/lib/waitlist/schema";

/**
 * Signups must never be silently dropped. With a database configured they go to
 * Postgres; in local development without one they go to a gitignored JSONL file
 * so the flow is testable end to end. In production a missing database is a hard
 * error rather than a fake success — a landing page that pretends to capture is
 * worse than one that is down.
 */
const LOCAL_FILE = path.join(process.cwd(), ".waitlist-local.jsonl");

export type SignupMeta = { referrer?: string; userAgent?: string };

type LocalRow = {
  token: string;
  email: string;
  name: string;
  phone: string;
  stage: "CONTACT" | "QUALIFIED";
  createdAt: string;
  completedAt?: string;
} & Partial<QualifyStep> &
  SignupMeta;

export function newToken() {
  return randomBytes(24).toString("base64url");
}

/**
 * Where a signup can actually be kept.
 *
 * "none" is the pre-Neon production bridge: there is no database yet, so Slack
 * is the system of record. In that mode the caller MUST confirm Slack accepted
 * the lead before reporting success — see completeWaitlist.
 */
export type StoreMode = "database" | "local-file" | "none";

export function storeMode(): StoreMode {
  if (isDatabaseConfigured()) return "database";
  return process.env.NODE_ENV === "production" ? "none" : "local-file";
}

function usingLocalFile() {
  return storeMode() === "local-file";
}

async function readLocal(): Promise<LocalRow[]> {
  try {
    const raw = await readFile(LOCAL_FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LocalRow);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocal(rows: LocalRow[]) {
  await writeFile(LOCAL_FILE, rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
}

/** Step 1. Returns the token the browser needs to complete step 2. */
export async function saveContact(
  input: Pick<ContactStep, "name" | "email" | "phone">,
  meta: SignupMeta = {},
): Promise<string> {
  const token = newToken();

  // No durable store yet: hand back a token so the flow continues, and let
  // step 2 carry the contact details through to Slack.
  if (storeMode() === "none") return token;

  if (usingLocalFile()) {
    const rows = await readLocal();
    const existing = rows.find((r) => r.email === input.email);
    if (existing) {
      Object.assign(existing, input, meta);
      await writeLocal(rows);
      return existing.token;
    }
    rows.push({ ...input, ...meta, token, stage: "CONTACT", createdAt: new Date().toISOString() });
    await writeLocal(rows);
    return token;
  }

  // Upsert on email so someone who signs up twice updates their row instead of
  // hitting a unique-constraint error they cannot act on.
  const row = await getPrisma().waitlistSignup.upsert({
    where: { email: input.email },
    create: { ...input, ...meta, token },
    update: { name: input.name, phone: input.phone, ...meta },
    select: { token: true },
  });

  return row.token;
}

/** The contact fields a notification needs, returned by a successful step 2. */
export type CompletedSignup = {
  name: string;
  email: string;
  phone: string;
} & QualifyStep;

/**
 * Step 2. Enriches the row created by step 1 and returns the merged record so
 * the caller can notify without a second read. Returns null on an unknown token.
 */
export async function saveQualification(
  token: string,
  input: QualifyStep,
): Promise<CompletedSignup | null> {
  const details = {
    website: input.website || null,
    leadTypes: input.leadTypes,
    leadTypeOther: input.leadTypeOther || null,
    location: input.location,
    business: input.business,
    budgetPerLead: input.budgetPerLead,
    leadsPerMonth: input.leadsPerMonth,
  };

  // No durable store: nothing to enrich. The caller falls back to Slack.
  if (storeMode() === "none") return null;

  if (usingLocalFile()) {
    const rows = await readLocal();
    const row = rows.find((r) => r.token === token);
    if (!row) return null;
    Object.assign(row, input, {
      stage: "QUALIFIED" as const,
      completedAt: new Date().toISOString(),
    });
    await writeLocal(rows);
    return { name: row.name, email: row.email, phone: row.phone, ...input };
  }

  try {
    const row = await getPrisma().waitlistSignup.update({
      where: { token },
      data: { ...details, stage: "QUALIFIED", completedAt: new Date() },
      select: { name: true, email: true, phone: true },
    });
    return { ...row, ...input };
  } catch (error) {
    // P2025 — no row with that token. Not an error worth surfacing to the user.
    if ((error as { code?: string }).code === "P2025") return null;
    throw error;
  }
}
