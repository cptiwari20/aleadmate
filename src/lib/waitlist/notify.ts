import "server-only";
import { optionalEnv } from "@/lib/env";
import {
  BUDGET_PER_LEAD,
  LEADS_PER_MONTH,
  LEAD_TYPES,
  type QualifyStep,
} from "@/lib/waitlist/schema";

/**
 * Posts a new signup to a Slack workflow trigger.
 *
 * Two rules this module exists to enforce:
 *
 *  1. The webhook URL is a credential. It lives in the environment, never in
 *     source — this repository is public, and anyone holding the URL can post
 *     into the workspace.
 *  2. Notification failure must never fail a signup. The lead is already
 *     committed by the time this runs; Slack being down is our problem, not
 *     the visitor's.
 */
const TIMEOUT_MS = 5000;

type NotifyInput = {
  name: string;
  email: string;
  phone: string;
} & Partial<QualifyStep>;

const labelOf = (
  options: readonly { value: string; label: string }[],
  value?: string | null,
) => options.find((o) => o.value === value)?.label ?? value ?? "";

/**
 * The payload carries names, emails and phone numbers. A mistyped env var must
 * not become a PII leak to an arbitrary host, so the destination is pinned to
 * Slack over HTTPS.
 */
function resolveWebhook(): string | null {
  const raw = optionalEnv("SLACK_WAITLIST_WEBHOOK_URL");
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.hostname !== "hooks.slack.com") {
      console.error(
        `waitlist: refusing to send signup data to ${url.hostname} — ` +
          "SLACK_WAITLIST_WEBHOOK_URL must be an https://hooks.slack.com/... URL.",
      );
      return null;
    }
    return url.toString();
  } catch {
    console.error("waitlist: SLACK_WAITLIST_WEBHOOK_URL is not a valid URL.");
    return null;
  }
}

function buildPayload(input: NotifyInput): Record<string, string> {
  const leadTypes = (input.leadTypes ?? []).map((value) => labelOf(LEAD_TYPES, value));
  if (input.leadTypeOther) leadTypes.push(input.leadTypeOther);

  const otherInfos = [
    input.website ? `Website: ${input.website}` : null,
    input.business ? `Business: ${input.business}` : null,
    input.budgetPerLead
      ? `Budget per lead: ${labelOf(BUDGET_PER_LEAD, input.budgetPerLead)}`
      : null,
    input.leadsPerMonth
      ? `Leads per month: ${labelOf(LEADS_PER_MONTH, input.leadsPerMonth)}`
      : null,
  ].filter(Boolean);

  // Slack workflow variables are strings — arrays and numbers are rejected.
  return {
    data: "New Lead came",
    Name: input.name,
    Email: input.email,
    Phone: input.phone,
    Location: input.location ?? "",
    LeadType: leadTypes.join(", "),
    otherInfos: otherInfos.join(" · "),
  };
}

/** Returns true only when Slack confirmed receipt. */
export async function notifySlack(input: NotifyInput): Promise<boolean> {
  const webhook = resolveWebhook();
  if (!webhook) return false;

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(input)),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(
        `waitlist: Slack rejected the notification (${response.status}) ${detail.slice(0, 300)}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    // Never rethrown: when a database holds the lead, Slack is only a courtesy.
    // The caller decides whether a false return matters.
    console.error("waitlist: Slack notification failed", error);
    return false;
  }
}
