import type { Metadata } from "next";
import { LeadSearchPreview } from "@/components/waitlist/lead-search-preview";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";
import { ButtonLink, Container, Eyebrow } from "@/components/ui/primitives";
import { marketing } from "@/lib/site";

export const metadata: Metadata = {
  // Absolute: the root template would otherwise append " · aLeadMate" to a
  // title that already opens with the brand name.
  title: {
    absolute: "aLeadMate — an AI SDR that finds your leads and runs the outreach",
  },
  description: marketing.description,
  alternates: { canonical: "/" },
};

const STEPS = [
  {
    title: "Describe who you want",
    body: "“Dental clinics in Austin with 5+ staff.” Plain English, not a query builder. The agent turns it into a search across company, role, location, and size.",
  },
  {
    title: "It finds and verifies them",
    body: "Matching companies, the right contact at each one, and an email that is checked before it is ever used. Bad records get dropped instead of sent to.",
  },
  {
    title: "It runs the outreach",
    body: "Personalised first touches and timed follow-ups that stop the moment someone replies. Replies land in your inbox — you only handle the conversations.",
  },
];

const FEATURES = [
  {
    title: "Search in plain English",
    body: "No boolean strings, no filter trees. Describe the customer you want the way you'd describe them to a new hire.",
  },
  {
    title: "Verified contacts only",
    body: "Every address is validated before send. Protecting your sending domain matters more than raw list size.",
  },
  {
    title: "Personalised, not spun",
    body: "Each first touch references something real about that company. Mail-merge templates are what get you filtered.",
  },
  {
    title: "Follow-ups that know when to stop",
    body: "Sequences pause on reply, on out-of-office, and on an unsubscribe — automatically.",
  },
  {
    title: "You own the inbox",
    body: "The agent drafts and sends; replies go straight to you. No one is pretending to be a person who isn't there.",
  },
  {
    title: "Pay for leads, not seats",
    body: "Pricing follows the volume you actually need each month, which is why we ask for it on the form.",
  },
];

const FAQ = [
  {
    q: "What exactly is an AI SDR?",
    a: "A sales development rep does three things: builds a list, writes the first touch, and chases the follow-up. aLeadMate does those three things on your behalf and hands you the replies. It does not take the sales call — that's still you.",
  },
  {
    q: "Where do the leads come from?",
    a: "Public company and professional data, cross-checked across sources, with every email verified before it is used. We'll publish the exact sources we use before anyone is charged.",
  },
  {
    q: "Is this just a bigger send button?",
    a: "No. Volume is the easy part and the part that gets your domain blocked. The work is in targeting a list tightly enough that the outreach is worth reading, and stopping the sequence the moment it should stop.",
  },
  {
    q: "What does it cost?",
    a: "Not set yet, which is the honest answer. Pricing will follow leads delivered rather than seats, and the budget question on the form is how we calibrate it. Waitlist members see pricing before anyone is charged.",
  },
  {
    q: "When do I get access?",
    a: "Early access goes out in batches so each account gets set up properly. You'll get an email when your spot opens — no charge until you've seen leads you actually want.",
  },
];

export default function WaitlistLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <Container className="py-14 sm:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-text">
                <span className="size-1.5 rounded-full bg-accent" />
                Early access &mdash; now taking signups
              </span>

              <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-fg sm:text-5xl">
                Tell it who you want.{" "}
                <span className="text-accent-text">It finds them and starts the conversation.</span>
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                aLeadMate is an AI SDR. Describe your ideal customer in a sentence and it
                searches for them, verifies the contact details, writes the outreach, and
                runs the follow-ups &mdash; so the only thing landing on your desk is a reply.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href="#waitlist" size="lg">
                  Get early access
                </ButtonLink>
                <ButtonLink href="#how-it-works" variant="outline" size="lg">
                  See how it works
                </ButtonLink>
              </div>

              <p className="mt-4 text-sm text-faint">
                Takes 40 seconds. No credit card, and no charge until you&rsquo;ve seen leads
                you want.
              </p>
            </div>

            <LeadSearchPreview />
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-b border-border">
        <Container className="py-16">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-fg">
            One sentence in. Qualified conversations out.
          </h2>

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent-soft font-mono text-sm font-semibold text-accent-text">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-fg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <Container className="py-16">
          <Eyebrow>What the agent handles</Eyebrow>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-fg">
            The whole top of the funnel, minus the headcount.
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <h3 className="text-sm font-semibold text-fg">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="scroll-mt-20 border-b border-border bg-surface-2">
        <Container className="py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
            <div className="lg:pt-4">
              <Eyebrow>Join the waitlist</Eyebrow>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-fg">
                Get leads for your business, starting with your first batch.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
                Tell us who you sell to and how many leads you need each month. We&rsquo;ll
                have your agent configured before your spot opens, so the first search is
                already pointed at the right people.
              </p>

              <ul className="mt-8 space-y-3">
                {[
                  "Your target list built before you log in",
                  "Verified contacts, not scraped guesses",
                  "Pricing shown before anyone is charged",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                    <svg
                      viewBox="0 0 20 20"
                      className="mt-0.5 size-4 shrink-0 text-accent"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M4 10.5l4 4 8-8.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <WaitlistForm />
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20">
        <Container className="py-16">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-fg">
            The questions worth asking first.
          </h2>

          <dl className="mt-10 max-w-3xl divide-y divide-border border-y border-border">
            {FAQ.map((item) => (
              <div key={item.q} className="py-5">
                <dt className="text-base font-semibold text-fg">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">{item.a}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 rounded-2xl border border-border bg-surface p-6 text-center sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-fg">
              Stop buying lists. Start getting replies.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Early access is going out in batches. Join now and tell us what you need &mdash;
              your agent will be pointed at the right people before your spot opens.
            </p>
            <ButtonLink href="#waitlist" size="lg" className="mt-6">
              Get early access
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
