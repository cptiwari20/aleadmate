import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FlowTimeline } from "@/components/flow-timeline";
import { FunnelDiagram } from "@/components/funnel-diagram";
import { ResultsPanel } from "@/components/results-panel";
import { ButtonLink, Container, Eyebrow, Tag, TagLink } from "@/components/ui/primitives";
import { getPlaybook, getPlaybookSlugs } from "@/lib/content/loader";
import { absoluteUrl } from "@/lib/site";
import { channelBySlug, difficultyBySlug, icpBySlug, motionBySlug } from "@/lib/taxonomy";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPlaybookSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const playbook = await getPlaybook(slug);
  if (!playbook) return {};

  const url = `/p/${playbook.slug}`;
  const ogImage = `/p/${playbook.slug}/opengraph-image`;

  return {
    title: playbook.title,
    description: playbook.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: playbook.title,
      description: playbook.summary,
      url: absoluteUrl(url),
      images: [ogImage],
      publishedTime: playbook.publishedAt,
      modifiedTime: playbook.updatedAt ?? playbook.publishedAt,
      authors: [playbook.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: playbook.title,
      description: playbook.summary,
      images: [ogImage],
    },
  };
}

export default async function PlaybookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const playbook = await getPlaybook(slug);
  if (!playbook) notFound();

  const channel = channelBySlug(playbook.channel);
  const motion = motionBySlug(playbook.motion);
  const difficulty = difficultyBySlug(playbook.difficulty);

  const facts = [
    channel ? { label: "Channel", value: channel.label } : null,
    motion ? { label: "Motion", value: motion.label } : null,
    difficulty ? { label: "Difficulty", value: difficulty.label } : null,
    playbook.timeToFirstLead
      ? { label: "Time to first lead", value: playbook.timeToFirstLead }
      : null,
    playbook.costToRun ? { label: "Cost to run", value: playbook.costToRun } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);

  return (
    <article>
      <header className="border-b border-border bg-surface">
        <Container className="py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-2">
            {channel ? <TagLink href={`/c/${channel.slug}`}>{channel.label}</TagLink> : null}
            {playbook.icps.map((slug) => {
              const icp = icpBySlug(slug);
              return icp ? (
                <TagLink key={slug} href={`/for/${icp.slug}`}>
                  {icp.label}
                </TagLink>
              ) : null;
            })}
            {playbook.curated ? (
              <Tag className="bg-accent-soft text-accent-text">Curated</Tag>
            ) : null}
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl">
            {playbook.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{playbook.summary}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-faint">
            <span>
              by{" "}
              <Link
                href={`/u/${playbook.author.handle}`}
                className="font-medium text-muted underline-offset-4 hover:underline"
              >
                {playbook.author.name}
              </Link>
            </span>
            <span>{playbook.readingMinutes} min read</span>
            <span>Updated {playbook.updatedAt ?? playbook.publishedAt}</span>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {/* Forking lands in Phase 2; the affordance ships now so the page
                layout and the share card are already designed around it. */}
            <ButtonLink href="/submit" size="md">
              Fork this playbook
            </ButtonLink>
          </div>
        </Container>
      </header>

      <Container className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0">
          <section>
            <Eyebrow>The motion</Eyebrow>
            <h2 className="mt-2 mb-5 text-xl font-semibold text-fg">{playbook.funnel.name}</h2>
            <FunnelDiagram funnel={playbook.funnel} />
          </section>

          {playbook.results.length > 0 ? (
            <section className="mt-14">
              <Eyebrow>Reported results</Eyebrow>
              <h2 className="mt-2 mb-2 text-xl font-semibold text-fg">What it produced</h2>
              <p className="mb-5 max-w-2xl text-sm text-muted">
                Every number carries a date, a sample size, and a proof tier. Self-reported
                figures are labelled as such &mdash; treat them as a starting hypothesis, not a
                promise.
              </p>
              <ResultsPanel results={playbook.results} />
            </section>
          ) : null}

          <section className="mt-14">
            <Eyebrow>The sequences</Eyebrow>
            <h2 className="mt-2 mb-6 text-xl font-semibold text-fg">
              {playbook.flows.length === 1 ? "The flow" : "The flows"}
            </h2>
            <div className="space-y-12">
              {playbook.flows.map((flow) => (
                <FlowTimeline key={flow.slug} flow={flow} />
              ))}
            </div>
          </section>

          <section className="mt-14">
            <Eyebrow>The guide</Eyebrow>
            <div
              className="prose-am mt-4"
              dangerouslySetInnerHTML={{ __html: playbook.bodyHtml }}
            />
          </section>

          {playbook.affiliateDisclosure ? (
            <p className="mt-10 rounded-xl border border-tier-unverified-soft bg-tier-unverified-soft px-4 py-3 text-xs text-tier-unverified">
              <span className="font-semibold">Affiliate disclosure — </span>
              {playbook.affiliateDisclosure}
            </p>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-faint">At a glance</h2>
            <dl className="mt-3 space-y-2.5">
              {facts.map((fact) => (
                <div key={fact.label} className="flex justify-between gap-3 text-sm">
                  <dt className="text-muted">{fact.label}</dt>
                  <dd className="text-right font-medium text-fg">{fact.value}</dd>
                </div>
              ))}
            </dl>

            {playbook.stack.length > 0 ? (
              <div className="mt-4 border-t border-border pt-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-faint">Stack</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {playbook.stack.map((tool) => (
                    <TagLink key={tool} href={`/stack/${tool}`}>
                      {tool}
                    </TagLink>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </Container>
    </article>
  );
}
