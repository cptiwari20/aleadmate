import { z } from "zod";

export const leadStageSchema = z.enum([
  "inbox",
  "contacted",
  "interested",
  "proposal",
  "won",
  "lost",
]);

export const leadPrioritySchema = z.enum(["low", "medium", "high"]);

export const noteSchema = z.object({
  id: z.string(),
  leadId: z.string().optional(),
  content: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  type: z.enum(["manual", "ai", "system"]),
});

export const leadLinkSchema = z.object({
  id: z.string(),
  leadId: z.string().optional(),
  label: z.string().min(1),
  url: z.string().url(),
  createdAt: z.string(),
});

export const leadSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string().default(""),
  company: z.string().optional(),
  title: z.string().optional(),
  email: z.string().email().or(z.literal("")).optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  linkedinUrl: z.string().optional(),
  source: z.string().optional(),
  stage: leadStageSchema,
  value: z.number().optional(),
  currency: z.string().default("USD"),
  priority: leadPrioritySchema,
  tags: z.array(z.string()),
  nextFollowUpAt: z.string().optional(),
  lastContactedAt: z.string().optional(),
  nextAction: z.string().optional(),
  notes: z.array(noteSchema),
  links: z.array(leadLinkSchema),
  aiSummary: z.string().optional(),
  customFields: z.record(z.string(), z.string()).optional(),
  archived: z.boolean(),
});

export const leadCreateSchema = leadSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine((lead) => Boolean(lead.name || lead.company || lead.email), {
    message: "A lead needs at least a name, company, or email.",
    path: ["name"],
  });

export const aiLeadParseSchema = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  source: z.string().optional(),
  value: z.number().optional(),
  currency: z.string().optional(),
  suggestedStage: leadStageSchema.optional(),
  suggestedTags: z.array(z.string()).default([]),
  suggestedFollowUpDate: z.string().optional(),
  suggestedNextAction: z.string().optional(),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type AiLeadParseOutput = z.infer<typeof aiLeadParseSchema>;
