import Link from "next/link";
import { PlaybookCard } from "@/components/playbook-card";
import { ButtonLink, Container, Eyebrow } from "@/components/ui/primitives";
import { loadPlaybooks, rankPlaybooks } from "@/lib/content/loader";
import { CHANNELS } from "@/lib/taxonomy";

export default async function HomePage() {
  const playbooks = rankPlaybooks(await loadPlaybooks());
  const featured = playbooks.slice(0, 6);

  return (
    <>
      <section className="border-b border-border">
        <Container className="py-16 sm:py-24">
          <div className="max-w-3xl">
            <Eyebrow>Open library · free forever</Eyebrow>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-5xl">
              Lead-gen playbooks with the{" "}
              <span className="text-accent-text">numbers attached</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              Every funnel, flow, and email here is a live object you can read, copy, and
              fork &mdash; with dated, sample-sized results, labelled honestly. No login to
              read. No login to copy.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/library" size="lg">
                Browse the library
              </ButtonLink>
              <ButtonLink href="/submit" variant="outline" size="lg">
                Publish a playbook
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Eyebrow>Ranked by evidence, not recency</Eyebrow>
            <h2 className="mt-2 text-2xl font-semibold text-fg">Playbooks worth stealing</h2>
          </div>
          <Link
            href="/library"
            className="shrink-0 text-sm text-accent-text underline underline-offset-4"
          >
            See all
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted">
            No playbooks yet. Add one to <code className="font-mono">content/playbooks/</code>.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((playbook) => (
              <PlaybookCard key={playbook.slug} playbook={playbook} />
            ))}
          </div>
        )}
      </Container>

      <Container className="pb-16">
        <Eyebrow>By channel</Eyebrow>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((channel) => (
            <Link
              key={channel.slug}
              href={`/c/${channel.slug}`}
              className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
            >
              <div className="text-sm font-semibold text-fg">{channel.label}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{channel.blurb}</p>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
