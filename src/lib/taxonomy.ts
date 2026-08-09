/**
 * Facets. These drive browse, filtering, and the programmatic
 * `/c/[channel]/for/[icp]` long-tail pages, so slugs are permanent —
 * changing one breaks a URL that may already be ranking.
 */

export const CHANNELS = [
  { slug: "cold-email", label: "Cold email", blurb: "Outbound email to people who have never heard of you." },
  { slug: "linkedin", label: "LinkedIn", blurb: "Connection requests, DMs, and organic content." },
  { slug: "seo", label: "SEO & content", blurb: "Search-driven inbound that compounds." },
  { slug: "paid", label: "Paid ads", blurb: "Bought traffic: search, social, and retargeting." },
  { slug: "community", label: "Community", blurb: "Slack groups, forums, Reddit, and Discord." },
  { slug: "referral", label: "Referral", blurb: "Existing customers and partners introducing you." },
  { slug: "events", label: "Events", blurb: "Conferences, webinars, and meetups." },
  { slug: "calling", label: "Cold calling", blurb: "Phone-first outbound." },
] as const;

export const ICPS = [
  { slug: "saas-founders", label: "SaaS founders" },
  { slug: "agencies", label: "Agencies" },
  { slug: "ecommerce", label: "E-commerce brands" },
  { slug: "coaches", label: "Coaches & consultants" },
  { slug: "local-services", label: "Local services" },
  { slug: "real-estate", label: "Real estate" },
  { slug: "recruiters", label: "Recruiters" },
  { slug: "freelancers", label: "Freelancers" },
  { slug: "enterprise-it", label: "Enterprise IT" },
  { slug: "healthcare", label: "Healthcare & clinics" },
] as const;

export const MOTIONS = [
  { slug: "outbound", label: "Outbound" },
  { slug: "inbound", label: "Inbound" },
  { slug: "plg", label: "Product-led" },
  { slug: "partner", label: "Partner-led" },
] as const;

export const DIFFICULTIES = [
  { slug: "beginner", label: "Beginner" },
  { slug: "intermediate", label: "Intermediate" },
  { slug: "advanced", label: "Advanced" },
] as const;

export const PLAY_KINDS = [
  { slug: "email", label: "Email" },
  { slug: "dm", label: "DM" },
  { slug: "call-script", label: "Call script" },
  { slug: "ad", label: "Ad" },
  { slug: "landing-copy", label: "Landing copy" },
  { slug: "objection", label: "Objection handler" },
  { slug: "post", label: "Social post" },
] as const;

/**
 * Proof tiers. Never blur these — the credibility of the whole library
 * rests on the difference between them being visible and honest.
 */
export const PROOF_TIERS = [
  {
    slug: "unverified",
    label: "Self-reported",
    blurb: "Reported by the author. Not checked by anyone.",
  },
  {
    slug: "community",
    label: "Community signal",
    blurb: "Multiple people who forked this reported their own numbers.",
  },
  {
    slug: "verified",
    label: "Verified",
    blurb: "Backed by a screenshot or a connected data source.",
  },
] as const;

export const CHANNEL_SLUGS = CHANNELS.map((c) => c.slug);
export const ICP_SLUGS = ICPS.map((i) => i.slug);
export const MOTION_SLUGS = MOTIONS.map((m) => m.slug);
export const DIFFICULTY_SLUGS = DIFFICULTIES.map((d) => d.slug);
export const PLAY_KIND_SLUGS = PLAY_KINDS.map((p) => p.slug);
export const PROOF_TIER_SLUGS = PROOF_TIERS.map((t) => t.slug);

export type ChannelSlug = (typeof CHANNELS)[number]["slug"];
export type IcpSlug = (typeof ICPS)[number]["slug"];
export type MotionSlug = (typeof MOTIONS)[number]["slug"];
export type DifficultySlug = (typeof DIFFICULTIES)[number]["slug"];
export type PlayKindSlug = (typeof PLAY_KINDS)[number]["slug"];
export type ProofTierSlug = (typeof PROOF_TIERS)[number]["slug"];

export const channelBySlug = (slug: string) => CHANNELS.find((c) => c.slug === slug);
export const icpBySlug = (slug: string) => ICPS.find((i) => i.slug === slug);
export const motionBySlug = (slug: string) => MOTIONS.find((m) => m.slug === slug);
export const difficultyBySlug = (slug: string) => DIFFICULTIES.find((d) => d.slug === slug);
export const playKindBySlug = (slug: string) => PLAY_KINDS.find((p) => p.slug === slug);
export const proofTierBySlug = (slug: string) => PROOF_TIERS.find((t) => t.slug === slug);
