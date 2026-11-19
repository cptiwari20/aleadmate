import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader, PlaybookGrid } from "@/components/playbook-grid";
import { Container } from "@/components/ui/primitives";
import { loadPlaybooks, rankPlaybooks } from "@/lib/content/loader";
import { CHANNELS, channelBySlug } from "@/lib/taxonomy";

export const dynamicParams = false;

export function generateStaticParams() {
  return CHANNELS.map((c) => ({ channel: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ channel: string }>;
}): Promise<Metadata> {
  const { channel } = await params;
  const meta = channelBySlug(channel);
  if (!meta) return {};

  return {
    title: `${meta.label} playbooks`,
    description: `${meta.blurb} Free, forkable ${meta.label.toLowerCase()} playbooks with real results attached.`,
    alternates: { canonical: `/c/${meta.slug}` },
  };
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ channel: string }>;
}) {
  const { channel } = await params;
  const meta = channelBySlug(channel);
  if (!meta) notFound();

  const playbooks = rankPlaybooks(await loadPlaybooks()).filter((p) => p.channel === meta.slug);

  return (
    <Container className="py-12">
      <PageHeader
        eyebrow="Channel"
        title={`${meta.label} playbooks`}
        description={meta.blurb}
        count={playbooks.length}
      />
      <PlaybookGrid
        playbooks={playbooks}
        empty={`No ${meta.label.toLowerCase()} playbooks yet.`}
      />
    </Container>
  );
}
