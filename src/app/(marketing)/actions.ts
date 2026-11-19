"use server";

import { headers } from "next/headers";
import {
  contactStepSchema,
  qualifyStepSchema,
  toFieldErrors,
  type ActionResult,
} from "@/lib/waitlist/schema";
import { saveContact, saveQualification } from "@/lib/waitlist/store";

/**
 * In-memory, per-instance throttle. It is not a substitute for Upstash on a
 * multi-instance deploy, but it costs nothing and stops the trivial case of one
 * client hammering the endpoint. Swap for a shared store before launch.
 */
const RATE_LIMIT = { windowMs: 60_000, max: 5 };
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT.max;
}

async function requestMeta() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
  return {
    ip,
    referrer: h.get("referer") ?? undefined,
    userAgent: h.get("user-agent") ?? undefined,
  };
}

/** Step 1 — name, email, phone. Saved immediately so an abandon still counts. */
export async function startWaitlist(formData: FormData): Promise<ActionResult> {
  const parsed = contactStepSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    companyWebsite: formData.get("companyWebsite") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error) };
  }

  // Honeypot tripped. Report success so the bot has nothing to tune against.
  if (parsed.data.companyWebsite) {
    return { ok: true, token: "" };
  }

  const { ip, referrer, userAgent } = await requestMeta();
  if (rateLimited(ip)) {
    return { ok: false, errors: {}, message: "Too many attempts. Try again in a minute." };
  }

  try {
    const token = await saveContact(
      { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone },
      { referrer, userAgent },
    );
    return { ok: true, token };
  } catch (error) {
    console.error("waitlist: failed to save contact", error);
    return {
      ok: false,
      errors: {},
      message: "Something went wrong on our side. Please try again.",
    };
  }
}

/** Step 2 — what they want, where, and what they will pay for it. */
export async function completeWaitlist(
  token: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = qualifyStepSchema.safeParse({
    leadTypes: formData.getAll("leadTypes"),
    leadTypeOther: formData.get("leadTypeOther") ?? "",
    location: formData.get("location"),
    business: formData.get("business"),
    budgetPerLead: formData.get("budgetPerLead"),
    leadsPerMonth: formData.get("leadsPerMonth"),
  });

  if (!parsed.success) {
    return { ok: false, errors: toFieldErrors(parsed.error) };
  }

  // Empty token means step 1 was a honeypot hit; accept and store nothing.
  if (!token) return { ok: true, token: "" };

  const { ip } = await requestMeta();
  if (rateLimited(ip)) {
    return { ok: false, errors: {}, message: "Too many attempts. Try again in a minute." };
  }

  try {
    await saveQualification(token, parsed.data);
    return { ok: true, token };
  } catch (error) {
    console.error("waitlist: failed to save qualification", error);
    return {
      ok: false,
      errors: {},
      message: "Something went wrong on our side. Please try again.",
    };
  }
}
