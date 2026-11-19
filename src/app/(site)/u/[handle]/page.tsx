import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader, PlaybookGrid } from "@/components/playbook-grid";
import { Container } from "@/components/ui/primitives";
import { loadPlaybooks, rankPlaybooks } from "@/lib/content/loader";

export const dynamicParams = false;

export async function generateStaticParams() {
  const playbooks = await loadPlaybooks();
  const handles = new Set(playbooks.map((p) => p.author.handle));
  return [...handles].map((handle) => ({ handle }));
}

async function findAuthor(handle: string) {
  const playbooks = await loadPlaybooks();
  const authored = playbooks.filter((p) => p.author.handle === handle);
  return authored.length > 0 ? { author: authored[0].author, playbooks: authored } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const found = await findAuthor(handle);
  if (!found) return {};

  return {
    title: `${found.author.name} (@${handle})`,
    description: found.author.bio ?? `Lead-gen playbooks published by ${found.author.name}.`,
    alternates: { canonical: `/u/${handle}` },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const found = await findAuthor(handle);
  if (!found) notFound();

  const { author, playbooks } = found;

  return (
    <Container className="py-12">
      <PageHeader
        eyebrow={`@${author.handle}`}
        title={author.name}
        description={author.bio}
        count={playbooks.length}
      />

      {author.url ? (
        <p className="-mt-4 mb-8 text-sm">
          <a
            href={author.url}
            rel="nofollow ugc noopener noreferrer"
            target="_blank"
            className="text-accent-text underline underline-offset-4"
          >
            {author.url.replace(/^https?:\/\//, "")}
          </a>
        </p>
      ) : null}

      <PlaybookGrid playbooks={rankPlaybooks(playbooks)} />
    </Container>
  );
}
