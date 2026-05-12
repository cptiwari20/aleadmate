export const STAGES = [
  { id: "inbox", name: "Inbox" },
  { id: "contacted", name: "Contacted" },
  { id: "interested", name: "Interested" },
  { id: "proposal", name: "Proposal" },
  { id: "won", name: "Won" },
  { id: "lost", name: "Lost" },
] as const;

export type LeadStage = (typeof STAGES)[number]["id"];

export type LeadPriority = "low" | "medium" | "high";

export type NoteType = "manual" | "ai" | "system";

export type LeadNote = {
  id: string;
  leadId?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  type: NoteType;
};

export type LeadLink = {
  id: string;
  leadId?: string;
  label: string;
  url: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  company?: string;
  title?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedinUrl?: string;
  source?: string;
  stage: LeadStage;
  value?: number;
  currency?: string;
  priority: LeadPriority;
  tags: string[];
  nextFollowUpAt?: string;
  lastContactedAt?: string;
  nextAction?: string;
  notes: LeadNote[];
  links: LeadLink[];
  aiSummary?: string;
  customFields?: Record<string, string>;
  archived: boolean;
};

export type AppSettings = {
  theme: "light" | "dark" | "system";
  focusModeEnabled: boolean;
  hideValuesInFocus: boolean;
  aiProvider: "openrouter" | "openai-compatible";
  aiEndpoint: string;
  aiModel: string;
  aiApiKey: string;
  defaultCurrency: string;
  syncEnabled: boolean;
  syncPlan: string;
  accountEmail: string;
  lastSyncAt: string;
};
