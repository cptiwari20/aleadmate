import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { PROOF_TIERS } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Quality standards",
  description:
    "What gets published on aLeadMate, what gets removed, and what the three proof tiers actually mean.",
  alternates: { canonical: "/standards" },
};

const rules = [
  {
    title: "Every number carries a date and a sample size",
    body: "A result without a period and an n is not a result, it is a claim. The submission form rejects it, and playbooks with no results rank below playbooks that have them.",
  },
  {
    title: "Write your own copy",
    body: "Do not paste another company's emails, ads, or landing pages. Structure — timing, sequencing, triggers, benchmarks — is fair game and is most of the value. The prose belongs to whoever wrote it. Analyse and link out instead.",
  },
  {
    title: "Affiliate links must be disclosed",
    body: "Recommending a tool you earn from is fine. Not saying so is not. Undisclosed affiliate links are removed on the first report.",
  },
  {
    title: "No results you cannot defend",
    body: "Self-reported is a respectable tier — most of the library sits there. Inventing numbers to reach for a higher one is the one thing that gets an account removed rather than warned.",
  },
  {
    title: "Outbound links are nofollow until you have a track record",
    body: "New accounts get nofollow on every external link. It lifts once you have published something that people actually fork. This is not personal, it is what keeps an open library from becoming a link farm.",
  },
];

export default function StandardsPage() {
  return (
    <Container className="py-12">
      <div className="max-w-2xl">
        <Eyebrow>How this stays useful</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg">Quality standards</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Anyone can publish here without an invite. That only works if the bar is written
          down and enforced, so here it is.
        </p>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-fg">The three proof tiers</h2>
          <p className="mt-2 text-sm text-muted">
            These are never blurred together. The credibility of the whole library is the
            difference between them staying visible.
          </p>
          <dl className="mt-5 space-y-4">
            {PROOF_TIERS.map((tier) => (
              <div key={tier.slug} className="rounded-xl border border-border bg-surface p-4">
                <dt className="text-sm font-semibold text-fg">{tier.label}</dt>
                <dd className="mt-1 text-sm text-muted">{tier.blurb}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-fg">The rules</h2>
          <ol className="mt-5 space-y-6">
            {rules.map((rule, i) => (
              <li key={rule.title} className="flex gap-4">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-xs font-semibold text-muted">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-fg">{rule.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{rule.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 rounded-xl border border-border bg-surface-2 p-5">
          <h2 className="text-sm font-semibold text-fg">Reporting something</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Every playbook will carry a report control from Phase 1. Until then, open an issue
            on the repository and it gets looked at the same day.
          </p>
        </section>
      </div>
    </Container>
  );
}
