import { z } from "zod";
import {
  CHANNEL_SLUGS,
  DIFFICULTY_SLUGS,
  ICP_SLUGS,
  MOTION_SLUGS,
  PLAY_KIND_SLUGS,
  PROOF_TIER_SLUGS,
} from "@/lib/taxonomy";

/**
 * One schema, two producers: the version-controlled seed corpus in `content/`
 * and (from Phase 1) the public submission form. Open publishing means
 * anything that isn't enforced here becomes a moderation problem later.
 */

const slug = z
  .string()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase kebab-case slug");

const enumFrom = <T extends readonly string[]>(values: T, name: string) =>
  z.string().refine((v) => (values as readonly string[]).includes(v), {
    message: `must be one of the known ${name}: ${values.join(", ")}`,
  });

/** A token the reader must replace before sending, e.g. `{{first_name}}`. */
export const variableSchema = z.object({
  token: z.string().regex(/^\{\{[a-z0-9_]+\}\}$/, "must look like {{snake_case}}"),
  description: z.string().min(3).max(160),
  example: z.string().max(120).optional(),
});

/** Play — the atomic asset. The thing people actually copy. */
export const playSchema = z.object({
  slug,
  kind: enumFrom(PLAY_KIND_SLUGS, "play kinds"),
  name: z.string().min(3).max(120),
  /** Email subject line, ad headline, or post hook — whatever gets the open. */
  hook: z.string().max(200).optional(),
  body: z.string().min(10).max(8000),
  /** Why this works. The part that separates a playbook from a swipe file. */
  rationale: z.string().max(600).optional(),
  variables: z.array(variableSchema).max(20).default([]),
});

/** One step in a Flow: when it fires, and under what condition. */
export const flowStepSchema = z.object({
  /** Days after the flow starts. Step 1 is normally day 0. */
  day: z.number().int().min(0).max(365),
  /** Fires only if this is true, e.g. "no reply to step 2". */
  condition: z.string().max(160).optional(),
  channel: enumFrom(CHANNEL_SLUGS, "channels").optional(),
  play: playSchema,
});

/** Flow — ordered Plays with timing and branching. */
export const flowSchema = z.object({
  slug,
  name: z.string().min(3).max(120),
  goal: z.string().min(10).max(300),
  steps: z.array(flowStepSchema).min(1).max(30),
  /** What makes you stop the sequence. Most templates omit this; they shouldn't. */
  exitCriteria: z.array(z.string().max(160)).max(10).default([]),
});

/** One stage of the end-to-end motion, with an optional benchmark. */
export const funnelStageSchema = z.object({
  key: slug,
  label: z.string().min(2).max(60),
  description: z.string().max(400).optional(),
  /** e.g. "Reply rate", paired with "3.1%". Displayed on the diagram. */
  benchmarkLabel: z.string().max(40).optional(),
  benchmarkValue: z.string().max(24).optional(),
  /** Links a stage to one of the playbook's flows. */
  flowSlug: slug.optional(),
});

export const funnelSchema = z.object({
  slug,
  name: z.string().min(3).max(120),
  stages: z.array(funnelStageSchema).min(2).max(8),
});

/** Result — a dated, sized outcome. The reason a page is worth sharing. */
export const resultSchema = z.object({
  label: z.string().min(2).max(60),
  value: z.number(),
  unit: z.enum(["percent", "count", "currency", "ratio", "days"]),
  currency: z.string().length(3).optional(),
  /** How many contacts / sessions / sends the number is based on. */
  sampleSize: z.number().int().positive().optional(),
  /** YYYY-MM. A result with no date is not a result. */
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "must be YYYY-MM"),
  proofTier: enumFrom(PROOF_TIER_SLUGS, "proof tiers"),
  note: z.string().max(300).optional(),
  /** Required by the UI whenever proofTier is `verified`. */
  proofUrl: z.string().url().optional(),
});

export const authorSchema = z.object({
  handle: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "handle must be lowercase alphanumeric or underscore"),
  name: z.string().min(2).max(60),
  bio: z.string().max(200).optional(),
  url: z.string().url().optional(),
});

export const playbookFrontmatterSchema = z
  .object({
    slug,
    title: z.string().min(6).max(120),
    /** One sentence. Used on cards, in search results, and on the OG image. */
    summary: z.string().min(20).max(240),

    channel: enumFrom(CHANNEL_SLUGS, "channels"),
    icps: z.array(enumFrom(ICP_SLUGS, "ICPs")).min(1).max(5),
    motion: enumFrom(MOTION_SLUGS, "motions"),
    difficulty: enumFrom(DIFFICULTY_SLUGS, "difficulties"),

    timeToFirstLead: z.string().max(40).optional(),
    costToRun: z.string().max(40).optional(),
    stack: z.array(slug).max(12).default([]),

    author: authorSchema,
    /** Staff-curated seed content. Anchors the quality bar for contributors. */
    curated: z.boolean().default(false),
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD"),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD").optional(),

    funnel: funnelSchema,
    flows: z.array(flowSchema).min(1).max(10),
    results: z.array(resultSchema).max(20).default([]),

    /** Contributor confirms they own or have the right to publish this. */
    rightsConfirmed: z.boolean(),
    /** Required disclosure when the playbook links to affiliate offers. */
    affiliateDisclosure: z.string().max(300).optional(),
  })
  .superRefine((value, ctx) => {
    const flowSlugs = new Set(value.flows.map((f) => f.slug));

    for (const [i, stage] of value.funnel.stages.entries()) {
      if (stage.flowSlug && !flowSlugs.has(stage.flowSlug)) {
        ctx.addIssue({
          code: "custom",
          path: ["funnel", "stages", i, "flowSlug"],
          message: `no flow with slug "${stage.flowSlug}" in this playbook`,
        });
      }
      if (Boolean(stage.benchmarkLabel) !== Boolean(stage.benchmarkValue)) {
        ctx.addIssue({
          code: "custom",
          path: ["funnel", "stages", i],
          message: "benchmarkLabel and benchmarkValue must be set together",
        });
      }
    }

    for (const [i, result] of value.results.entries()) {
      if (result.proofTier === "verified" && !result.proofUrl) {
        ctx.addIssue({
          code: "custom",
          path: ["results", i, "proofUrl"],
          message: "a verified result needs a proofUrl — otherwise it is self-reported",
        });
      }
      if (result.unit === "currency" && !result.currency) {
        ctx.addIssue({
          code: "custom",
          path: ["results", i, "currency"],
          message: "currency results need a 3-letter currency code",
        });
      }
    }

    if (!value.rightsConfirmed) {
      ctx.addIssue({
        code: "custom",
        path: ["rightsConfirmed"],
        message: "cannot publish without confirming rights to the content",
      });
    }

    // Duplicate play slugs break copy-links and deep links into a flow.
    const seen = new Set<string>();
    for (const flow of value.flows) {
      for (const step of flow.steps) {
        if (seen.has(step.play.slug)) {
          ctx.addIssue({
            code: "custom",
            path: ["flows"],
            message: `duplicate play slug "${step.play.slug}" within this playbook`,
          });
        }
        seen.add(step.play.slug);
      }
    }
  });

export type Variable = z.infer<typeof variableSchema>;
export type Play = z.infer<typeof playSchema>;
export type FlowStep = z.infer<typeof flowStepSchema>;
export type Flow = z.infer<typeof flowSchema>;
export type FunnelStage = z.infer<typeof funnelStageSchema>;
export type Funnel = z.infer<typeof funnelSchema>;
export type Result = z.infer<typeof resultSchema>;
export type Author = z.infer<typeof authorSchema>;
export type PlaybookFrontmatter = z.infer<typeof playbookFrontmatterSchema>;

export type Playbook = PlaybookFrontmatter & {
  /** Rendered, sanitised HTML of the markdown body. */
  bodyHtml: string;
  /** Minutes, from the raw markdown. */
  readingMinutes: number;
};
