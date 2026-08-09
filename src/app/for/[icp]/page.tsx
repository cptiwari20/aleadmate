import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader, PlaybookGrid } from "@/components/playbook-grid";
import { Container } from "@/components/ui/primitives";
import { loadPlaybooks, rankPlaybooks } from "@/lib/content/loader";
import { ICPS, icpBySlug } from "@/lib/taxonomy";

export const dynamicParams = false;

export function generateStaticParams() {
  return ICPS.map((i) => ({ icp: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ icp: string }>;
}): Promise<Metadata> {
  const { icp } = await params;
  const meta = icpBySlug(icp);
  if (!meta) return {};

  return {
    title: `Playbooks for ${meta.label.toLowerCase()}`,
    description: `Lead-gen playbooks built for ${meta.label.toLowerCase()}, with dated results attached. Free to read and fork.`,
    alternates: { canonical: `/for/${meta.slug}` },
  };
}

export default async function IcpPage({ params }: { params: Promise<{ icp: string }> }) {
  const { icp } = await params;
  const meta = icpBySlug(icp);
  if (!meta) notFound();

  const playbooks = rankPlaybooks(await loadPlaybooks()).filter((p) =>
    p.icps.includes(meta.slug),
  );

  return (
    <Container className="py-12">
      <PageHeader
        eyebrow="Audience"
        title={`Playbooks for ${meta.label.toLowerCase()}`}
        count={playbooks.length}
      />
      <PlaybookGrid
        playbooks={playbooks}
        empty={`No playbooks for ${meta.label.toLowerCase()} yet.`}
      />
    </Container>
  );
}
