import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PlaybookGrid } from "@/components/playbook-grid";
import { Container } from "@/components/ui/primitives";
import { loadPlaybooks, rankPlaybooks } from "@/lib/content/loader";
import { CHANNELS, ICPS } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Library",
  description:
    "Every lead-gen playbook in the aLeadMate library. Free to read, free to copy, ranked by the evidence attached.",
};

export default async function LibraryPage() {
  const playbooks = rankPlaybooks(await loadPlaybooks());

  return (
    <Container className="py-12">
      <PageHeader
        eyebrow="The library"
        title="Every playbook"
        description="Funnels, flows, and plays with dated results attached. Nothing here is behind a login."
        count={playbooks.length}
      />

      <div className="mb-8 flex flex-col gap-4 border-y border-border py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-faint">
            Channel
          </span>
          {CHANNELS.map((channel) => (
            <Link
              key={channel.slug}
              href={`/c/${channel.slug}`}
              className="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-border hover:text-fg"
            >
              {channel.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-faint">
            Audience
          </span>
          {ICPS.map((icp) => (
            <Link
              key={icp.slug}
              href={`/for/${icp.slug}`}
              className="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-border hover:text-fg"
            >
              {icp.label}
            </Link>
          ))}
        </div>
      </div>

      <PlaybookGrid
        playbooks={playbooks}
        empty="No playbooks yet. Drop a markdown file into content/playbooks/ to add one."
      />
    </Container>
  );
}
