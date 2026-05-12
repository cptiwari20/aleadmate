import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { leadCreateSchema } from "@/lib/validations";
import type { LeadPriority, LeadStage } from "@/types/lead";

const stageToDb: Record<LeadStage, "INBOX" | "CONTACTED" | "INTERESTED" | "PROPOSAL" | "WON" | "LOST"> = {
  inbox: "INBOX",
  contacted: "CONTACTED",
  interested: "INTERESTED",
  proposal: "PROPOSAL",
  won: "WON",
  lost: "LOST",
};

const priorityToDb: Record<LeadPriority, "LOW" | "MEDIUM" | "HIGH"> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const prisma = getPrisma();
  const leads = await prisma.lead.findMany({
    where: { workspaceId, archived: false },
    include: { notes: true, links: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  const body = await request.json();
  const workspaceId = body.workspaceId as string | undefined;
  const parsed = leadCreateSchema.safeParse(body.lead);

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const lead = parsed.data;
  const prisma = getPrisma();
  const created = await prisma.lead.create({
    data: {
      workspaceId,
      name: lead.name,
      company: lead.company,
      title: lead.title,
      email: lead.email || null,
      phone: lead.phone,
      website: lead.website,
      linkedinUrl: lead.linkedinUrl,
      source: lead.source,
      stage: stageToDb[lead.stage],
      value: lead.value,
      currency: lead.currency,
      priority: priorityToDb[lead.priority],
      tags: lead.tags,
      nextFollowUpAt: lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt) : null,
      lastContactedAt: lead.lastContactedAt ? new Date(lead.lastContactedAt) : null,
      nextAction: lead.nextAction,
      aiSummary: lead.aiSummary,
      customFields: lead.customFields ?? undefined,
      notes: {
        create: lead.notes.map((note) => ({
          content: note.content,
          type: note.type.toUpperCase() as "MANUAL" | "AI" | "SYSTEM",
        })),
      },
      links: {
        create: lead.links.map((link) => ({
          label: link.label,
          url: link.url,
        })),
      },
    },
    include: { notes: true, links: true },
  });

  return NextResponse.json({ lead: created }, { status: 201 });
}
