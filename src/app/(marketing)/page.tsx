import type { Metadata } from "next";
import { MateAvatar } from "@/components/brand/mate";
import { AgentConsole } from "@/components/waitlist/agent-console";
import { WebsiteProvider } from "@/components/waitlist/website-context";
import { WebsiteStart } from "@/components/waitlist/website-start";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";
import { ButtonLink, Container } from "@/components/ui/primitives";
import { marketing } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  // Absolute: the root template would otherwise append " · aLeadMate" to a
  // title that already opens with the brand name.
  title: {
    absolute: "aLeadMate — an AI SDR that finds your leads and runs the outreach",
  },
  description: marketing.description,
  alternates: { canonical: "/" },
};

const MARQUEE = [
  "Dental clinics",
  "Shopify brands",
  "Series A SaaS",
  "Marketing agencies",
  "Roofing contractors",
  "Private clinics",
  "Recruiting firms",
  "Law practices",
  "Fitness studios",
  "Manufacturers",
  "Real estate teams",
  "Accounting firms",
];

const STEPS = [
  {
    kicker: "01",
    title: "Describe who you want",
    body: "“Dental clinics in Austin with 5+ staff.” Plain English, not a query builder. Mate turns one sentence into a search across company, role, location, and size.",
  },
  {
    kicker: "02",
    title: "Mate finds and verifies them",
    body: "Matching companies, the right contact at each one, and an email checked before it is ever used. Bad records get dropped instead of sent to.",
  },
  {
    kicker: "03",
    title: "Mate runs the outreach",
    body: "Personalised first touches and timed follow-ups that stop the moment someone replies. You only handle the conversations.",
  },
];

const MATE_SHIFT = [
  { time: "06:00", task: "Pulls new companies matching your brief" },
  { time: "07:30", task: "Verifies every address, drops the bad ones" },
  { time: "08:15", task: "Writes a first touch referencing something real" },
  { time: "09:00", task: "Sends, then watches for replies all day" },
  { time: "16:00", task: "Queues tomorrow's follow-ups, pauses anyone who replied" },
];

const BENTO = [
  {
    title: "Search in plain English",
    body: "No boolean strings, no filter trees. Describe the customer you want the way you'd describe them to a new hire.",
    span: "lg:col-span-2",
    accent: true,
  },
  {
    title: "Verified contacts only",
    body: "Every address validated before send. Protecting your sending domain matters more than raw list size.",
    span: "",
  },
  {
    title: "Personalised, not spun",
    body: "Each first touch references something real about that company. Mail-merge templates are what get you filtered.",
    span: "",
  },
  {
    title: "Follow-ups that know when to stop",
    body: "Sequences pause on reply, on out-of-office, and on unsubscribe — automatically, without you watching.",
    span: "lg:col-span-2",
  },
  {
    title: "You own the inbox",
    body: "Mate drafts and sends; replies go straight to you. Mate never pretends to be a person who isn't there.",
    span: "",
  },
  {
    title: "Pay for leads, not seats",
    body: "Pricing follows the volume you actually need each month — which is exactly what the form asks you.",
    span: "",
  },
];

const FAQ = [
  {
    q: "Who is Mate?",
    a: "Mate is the AI SDR that does the work. A sales development rep builds a list, writes the first touch, and chases the follow-up — Mate does those three on your behalf and hands you the replies. Mate does not take the sales call. That's still you.",
  },
  {
    q: "Where does Mate get the leads?",
    a: "Public company and professional data, cross-checked across sources, with every email verified before it is used. We'll publish the exact sources before anyone is charged.",
  },
  {
    q: "Is this just a bigger send button?",
    a: "No. Volume is the easy part and the part that gets your domain blocked. The work is targeting a list tightly enough that the outreach is worth reading, and stopping the sequence the moment it should stop.",
  },
  {
    q: "What does it cost?",
    a: "Not set yet — that's the honest answer. Pricing will follow leads delivered rather than seats, and the budget question on the form is how we calibrate it. Waitlist members see pricing before anyone is charged.",
  },
  {
    q: "When do I get access?",
    a: "Early access goes out in batches so each account gets set up properly. You'll get an email when your spot opens, and there's no charge until you've seen leads you actually want.",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
      <span className="size-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

export default function WaitlistLandingPage() {
  return (
    <WebsiteProvider>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="glow-field" aria-hidden="true" />
        <div className="grid-field" aria-hidden="true" />

        <Container className="relative py-16 sm:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="anim-fade-up min-w-0">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface py-1 pl-1 pr-4 text-xs font-medium text-muted">
                <MateAvatar size={26} />
                Meet <span className="text-fg">Mate</span> &mdash; early access open
              </span>

              <h1 className="mt-6 text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.03em] text-fg sm:text-[3.4rem] xl:text-6xl">
                Start with your website.
                <br />
                <span className="text-gradient">Mate finds the rest.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Type your web address. Mate reads what you sell, works out who buys it,
                finds those exact people with verified emails, and writes the first touch.
                See what it picks up before you join.
              </p>

              <div className="mt-9">
                <WebsiteStart />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-faint">
                {["Takes about 20 seconds", "No account needed", "Invitations go out in batches"].map(
                  (item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <svg
                        viewBox="0 0 20 20"
                        className="size-3.5 text-accent"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        aria-hidden="true"
                      >
                        <path d="M4 10.5l4 4 8-8.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="anim-float min-w-0">
              <AgentConsole />
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- Marquee ---------------- */}
      <section className="group overflow-hidden border-b border-border bg-surface/50 py-5">
        <div className="mask-fade-x flex">
          <div className="anim-marquee flex shrink-0 items-center gap-3 pr-3">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="whitespace-nowrap rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-faint">
          Point it at any niche. If you can describe them, it can find them.
        </p>
      </section>

      {/* ---------------- Meet Mate ---------------- */}
      <section id="mate" className="relative scroll-mt-20 overflow-hidden border-b border-border">
        <div className="glow-field opacity-60" aria-hidden="true" />

        <Container className="relative py-20">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
              <div className="anim-float">
                <MateAvatar size={132} busy />
              </div>

              <h2 className="mt-8 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                This is Mate.
              </h2>
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-accent-text">
                Your AI sales development rep
              </p>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
                Mate does the part of sales nobody wants to do: building the list, checking
                it&rsquo;s real, writing the first message, and chasing the follow-up. Mate
                works the whole shift and hands you only the replies.
              </p>

              <dl className="mt-8 grid w-full max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
                {[
                  ["Works", "24/7"],
                  ["Onboarding", "40 sec"],
                  ["Seats needed", "0"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[11px] uppercase tracking-wider text-faint">{label}</dt>
                    <dd className="mt-1 font-mono text-xl font-semibold text-fg">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Mate's shift */}
            <div className="ring-gradient relative min-w-0 rounded-2xl border border-border bg-surface/80 p-6 backdrop-blur sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                <h3 className="text-sm font-semibold text-fg">A day on Mate&rsquo;s shift</h3>
              </div>

              <ol className="mt-6 space-y-5 border-l border-border pl-6">
                {MATE_SHIFT.map((entry) => (
                  <li key={entry.time} className="relative">
                    <span className="absolute -left-[1.6875rem] top-1 flex size-4 items-center justify-center rounded-full border border-border bg-bg">
                      <span className="size-1.5 rounded-full bg-accent" />
                    </span>
                    <div className="font-mono text-xs font-semibold text-accent-text">
                      {entry.time}
                    </div>
                    <div className="mt-0.5 text-sm text-muted">{entry.task}</div>
                  </li>
                ))}
              </ol>

              <p className="mt-6 border-t border-border pt-4 text-xs text-faint">
                You pick up at the reply. Mate handles everything before it.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section id="how-it-works" className="scroll-mt-20 border-b border-border">
        <Container className="py-20">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            One sentence in. Qualified conversations out.
          </h2>

          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <li
                key={step.kicker}
                className="relative rounded-2xl border border-border bg-surface p-6"
              >
                <span className="font-mono text-xs font-semibold tracking-widest text-accent">
                  {step.kicker}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-fg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ---------------- Bento ---------------- */}
      <section className="border-b border-border">
        <Container className="py-20">
          <SectionLabel>What the agent handles</SectionLabel>
          <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            The whole top of the funnel, minus the headcount.
          </h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENTO.map((item) => (
              <div
                key={item.title}
                className={cn(
                  "relative overflow-hidden rounded-2xl border border-border bg-surface p-6",
                  item.span,
                  item.accent && "ring-gradient",
                )}
              >
                {item.accent ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-accent/10 blur-2xl"
                  />
                ) : null}
                <h3 className="relative text-base font-semibold text-fg">{item.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------- Waitlist ---------------- */}
      <section
        id="waitlist"
        className="relative scroll-mt-20 overflow-hidden border-b border-border bg-surface-2/40"
      >
        <div className="glow-field opacity-70" aria-hidden="true" />

        <Container className="relative py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)]">
            <div className="lg:pt-2">
              <SectionLabel>Join the waitlist</SectionLabel>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                Tell us who to go after.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
                Two steps, about forty seconds. We&rsquo;ll have your agent configured
                before your spot opens, so the first search is already pointed at the right
                people.
              </p>

              <ul className="mt-9 space-y-4">
                {[
                  ["Your target list built before you log in", "No blank-canvas first session."],
                  ["Verified contacts, not scraped guesses", "Your sending domain survives."],
                  ["Pricing shown before anyone is charged", "Waitlist members see it first."],
                ].map(([title, sub]) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                      <svg
                        viewBox="0 0 20 20"
                        className="size-3 text-accent-text"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        aria-hidden="true"
                      >
                        <path d="M4 10.5l4 4 8-8.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-fg">{title}</span>
                      <span className="block text-sm text-faint">{sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <WaitlistForm />
          </div>
        </Container>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" className="scroll-mt-20">
        <Container className="py-20">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            The questions worth asking first.
          </h2>

          <dl className="mt-10 max-w-3xl divide-y divide-border border-y border-border">
            {FAQ.map((item) => (
              <div key={item.q} className="py-6">
                <dt className="text-base font-semibold text-fg">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">{item.a}</dd>
              </div>
            ))}
          </dl>

          <div className="ring-gradient relative mt-16 overflow-hidden rounded-3xl border border-border bg-surface p-8 text-center sm:p-14">
            <div className="glow-field !inset-x-0 !-top-1/2 !h-[150%]" aria-hidden="true" />
            <h2 className="relative text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              Stop buying lists.
              <br className="sm:hidden" /> Start getting replies.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
              Early access goes out in batches. Join now and tell us what you need &mdash;
              your agent will be pointed at the right people before your spot opens.
            </p>
            <ButtonLink
              href="#waitlist"
              size="lg"
              className="relative mt-8 shadow-lg shadow-accent/20"
            >
              Get early access
            </ButtonLink>
          </div>
        </Container>
      </section>
    </WebsiteProvider>
  );
}
