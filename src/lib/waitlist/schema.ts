import { z } from "zod";

/**
 * Two-step by design. Step 1 is saved on its own so a visitor who abandons the
 * qualifying questions is still a captured lead rather than a lost one.
 */

export const LEAD_TYPES = [
  { value: "local-businesses", label: "Local businesses" },
  { value: "saas", label: "SaaS & tech" },
  { value: "ecommerce", label: "E-commerce brands" },
  { value: "agencies", label: "Agencies & consultancies" },
  { value: "real-estate", label: "Real estate" },
  { value: "healthcare", label: "Healthcare & clinics" },
  { value: "construction", label: "Construction & trades" },
  { value: "finance", label: "Finance & insurance" },
  { value: "hospitality", label: "Hospitality & food" },
  { value: "education", label: "Education & training" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "other", label: "Something else" },
] as const;

export const BUDGET_PER_LEAD = [
  { value: "under-5", label: "Under $5" },
  { value: "5-15", label: "$5 – $15" },
  { value: "15-50", label: "$15 – $50" },
  { value: "50-150", label: "$50 – $150" },
  { value: "over-150", label: "$150+" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export const LEADS_PER_MONTH = [
  { value: "under-100", label: "Under 100" },
  { value: "100-500", label: "100 – 500" },
  { value: "500-2000", label: "500 – 2,000" },
  { value: "2000-10000", label: "2,000 – 10,000" },
  { value: "over-10000", label: "10,000+" },
] as const;

const values = <T extends readonly { value: string }[]>(options: T) =>
  options.map((o) => o.value) as unknown as [string, ...string[]];

/** Lenient on format, strict on plausibility — real numbers vary wildly. */
const phone = z
  .string()
  .trim()
  .min(1, "Enter your phone number")
  .transform((v) => v.replace(/[\s().-]/g, ""))
  .refine((v) => /^\+?\d{7,15}$/.test(v), "Enter a valid phone number");

export const contactStepSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(160),
  phone,
  /** Honeypot. Real people never see this field, so anything in it is a bot. */
  companyWebsite: z.string().max(0).optional().default(""),
});

export const qualifyStepSchema = z
  .object({
    leadTypes: z
      .array(z.enum(values(LEAD_TYPES)))
      .min(1, "Pick at least one")
      .max(LEAD_TYPES.length),
    leadTypeOther: z.string().trim().max(120).optional().default(""),
    location: z.string().trim().min(2, "Where should we look?").max(120),
    business: z.string().trim().min(2, "Tell us about your business").max(160),
    budgetPerLead: z.enum(values(BUDGET_PER_LEAD), {
      message: "Pick a budget range",
    }),
    leadsPerMonth: z.enum(values(LEADS_PER_MONTH), {
      message: "Pick a monthly volume",
    }),
  })
  .superRefine((value, ctx) => {
    if (value.leadTypes.includes("other") && value.leadTypeOther.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["leadTypeOther"],
        message: "Tell us what kind of leads you need",
      });
    }
  });

export type ContactStep = z.infer<typeof contactStepSchema>;
export type QualifyStep = z.infer<typeof qualifyStepSchema>;

export type FieldErrors = Record<string, string>;

export type ActionResult =
  | { ok: true; token: string }
  | { ok: false; errors: FieldErrors; message?: string };

/** Flattens a ZodError into the shape the form renders directly. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    errors[key] ??= issue.message;
  }
  return errors;
}
