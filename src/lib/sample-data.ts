import type { Lead, LeadNote } from "@/types/lead";
import { nowIso, todayOffset } from "@/lib/date";

export function createNote(content: string, type: LeadNote["type"] = "manual"): LeadNote {
  return {
    id: crypto.randomUUID(),
    content,
    type,
    createdAt: nowIso(),
  };
}

export function sampleLeads(): Lead[] {
  return [
    {
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      name: "Priya Kapoor",
      company: "Stellar Labs",
      title: "Marketing Head",
      email: "priya@stellarlabs.com",
      phone: "+91 98765 44120",
      source: "LinkedIn",
      stage: "proposal",
      value: 80000,
      currency: "INR",
      priority: "high",
      tags: ["website", "warm"],
      nextFollowUpAt: todayOffset(0),
      lastContactedAt: todayOffset(-3),
      nextAction: "Send pricing clarification",
      notes: [createNote("Met after a referral. Comparing a competitor quote and wants a clean redesign proposal.")],
      links: [],
      aiSummary: "Warm redesign lead with budget around INR 80,000. Needs pricing clarification today.",
      archived: false,
    },
    {
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      name: "Sarah Chen",
      company: "Voltaic Studio",
      title: "Founder",
      email: "sarah@voltaic.example",
      source: "Conference",
      stage: "interested",
      value: 4200,
      currency: "USD",
      priority: "medium",
      tags: ["agency", "case-study"],
      nextFollowUpAt: todayOffset(1),
      nextAction: "Share a relevant case study",
      notes: [createNote("Asked for examples from service businesses with short sales cycles.")],
      links: [],
      archived: false,
    },
    {
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      name: "Mike Rivera",
      company: "Nexum",
      title: "Operations Lead",
      email: "mike@nexum.example",
      source: "Website form",
      stage: "contacted",
      value: 12000,
      currency: "USD",
      priority: "low",
      tags: ["ops", "no-reply"],
      nextFollowUpAt: todayOffset(-2),
      nextAction: "Check if timing changed",
      notes: [createNote("Reached out last week. No response after initial discovery email.")],
      links: [],
      archived: false,
    },
  ];
}
