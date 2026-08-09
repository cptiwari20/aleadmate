import { optionalEnv } from "@/lib/env";

/**
 * Resend over raw SMTP, and a plain fetch rather than the SDK — one dependency
 * fewer, and this is the only transactional email in the system until the
 * weekly digest lands in Phase 2.
 *
 * With no API key configured the link is logged instead of sent, so local
 * sign-in works before any email provider exists.
 */
export async function sendMagicLinkEmail({ email, url }: { email: string; url: string }) {
  const apiKey = optionalEnv("RESEND_API_KEY");
  const from = optionalEnv("EMAIL_FROM") ?? "aLeadMate <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set — magic links cannot be delivered.");
    }
    console.log(`\n  Magic link for ${email}:\n  ${url}\n`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Your aLeadMate sign-in link",
      text: [
        "Here is your sign-in link. It expires in 10 minutes.",
        "",
        url,
        "",
        "If you did not request this, you can ignore it.",
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend rejected the magic link email: ${response.status}`);
  }
}
