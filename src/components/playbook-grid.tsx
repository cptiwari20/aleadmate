import { PlaybookCard } from "@/components/playbook-card";
import type { Playbook } from "@/lib/content/schema";

export function PlaybookGrid({
  playbooks,
  empty = "Nothing here yet.",
}: {
  playbooks: Playbook[];
  empty?: string;
}) {
  if (playbooks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted">
        {empty}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {playbooks.map((playbook) => (
        <PlaybookCard key={playbook.slug} playbook={playbook} />
      ))}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  count,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  count?: number;
}) {
  return (
    <header className="mb-8">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">{eyebrow}</p>
      ) : null}
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg">{title}</h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{description}</p>
      ) : null}
      {typeof count === "number" ? (
        <p className="mt-3 text-sm text-faint">
          {count} {count === 1 ? "playbook" : "playbooks"} · ranked by evidence, not recency
        </p>
      ) : null}
    </header>
  );
}
