import type { Metadata } from "next";
import { PageHeader, PlaybookGrid } from "@/components/playbook-grid";
import { Container } from "@/components/ui/primitives";
import { loadPlaybooks, rankPlaybooks } from "@/lib/content/loader";

export const dynamicParams = false;

export async function generateStaticParams() {
  const playbooks = await loadPlaybooks();
  const tools = new Set(playbooks.flatMap((p) => p.stack));
  return [...tools].map((tool) => ({ tool }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  return {
    title: `Playbooks that use ${tool}`,
    description: `Lead-gen playbooks built on ${tool}, with the full sequence and reported results.`,
    alternates: { canonical: `/stack/${tool}` },
  };
}

export default async function StackPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const playbooks = rankPlaybooks(await loadPlaybooks()).filter((p) => p.stack.includes(tool));

  return (
    <Container className="py-12">
      <PageHeader
        eyebrow="Stack"
        title={`Playbooks that use ${tool}`}
        count={playbooks.length}
      />
      <PlaybookGrid playbooks={playbooks} empty={`No playbooks use ${tool} yet.`} />
    </Container>
  );
}
