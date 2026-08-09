import type { Metadata } from "next";
import { ButtonLink, Container, Eyebrow } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Publish a playbook",
  description:
    "Publish a lead-gen playbook on aLeadMate. Open to anyone, no invite needed.",
  alternates: { canonical: "/submit" },
};

export default function SubmitPage() {
  return (
    <Container className="py-12">
      <div className="max-w-2xl">
        <Eyebrow>Open to anyone</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg">
          Publish a playbook
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          No invite, no application. The submission form lands in Phase 1 alongside accounts.
          Until then the corpus is seeded from version-controlled markdown in{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-sm">
            content/playbooks/
          </code>
          .
        </p>

        <div className="mt-8 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-fg">What a submission will require</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>· A funnel with at least two stages</li>
            <li>· At least one flow, with timing on every step</li>
            <li>· Results with a date and a sample size, or none at all</li>
            <li>· Confirmation that the copy is yours to publish</li>
            <li>· Disclosure of any affiliate relationship</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/standards" variant="outline">
            Read the quality standards
          </ButtonLink>
          <ButtonLink href="/library" variant="ghost">
            Browse the library
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
