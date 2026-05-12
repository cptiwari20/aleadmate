import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { leadSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = leadSchema.safeParse(body.lead);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const lead = parsed.data;
  const env = getServerEnv();
  const apiKey = env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      draft: `Hi ${lead.name || "there"}, quick follow-up. Is this still useful to explore${lead.company ? ` for ${lead.company}` : ""}?`,
      source: "template",
    });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Title": "LeadMate",
    },
    body: JSON.stringify({
      model: env.OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content: "You are LeadMate, a concise sales follow-up assistant. Return practical, editable text.",
        },
        {
          role: "user",
          content: `Draft a concise follow-up message for this lead:\n${JSON.stringify(lead, null, 2)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "AI provider failed" }, { status: 502 });
  }

  const data = await response.json();
  return NextResponse.json({
    draft: data.choices?.[0]?.message?.content?.trim() || "",
    source: "ai",
  });
}
