import Link from "next/link";
import { ProofBadge } from "@/components/proof-badge";
import { formatResultValue, primaryResult } from "@/components/results-panel";
import { Tag } from "@/components/ui/primitives";
import type { Playbook } from "@/lib/content/schema";
import { channelBySlug, difficultyBySlug } from "@/lib/taxonomy";

export function PlaybookCard({ playbook }: { playbook: Playbook }) {
  const channel = channelBySlug(playbook.channel);
  const difficulty = difficultyBySlug(playbook.difficulty);
  const headline = primaryResult(playbook.results);

  return (
    <article className="group relative flex flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong">
      <div className="flex flex-wrap items-center gap-2">
        {channel ? <Tag>{channel.label}</Tag> : null}
        {difficulty ? <Tag>{difficulty.label}</Tag> : null}
        {playbook.curated ? (
          <Tag className="bg-accent-soft text-accent-text">Curated</Tag>
        ) : null}
      </div>

      <h3 className="mt-3 text-base font-semibold leading-snug text-fg">
        <Link href={`/p/${playbook.slug}`} className="after:absolute after:inset-0">
          {playbook.title}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{playbook.summary}</p>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-3">
        {headline ? (
          <div>
            <div className="font-mono text-lg font-semibold tabular-nums text-fg">
              {formatResultValue(headline)}
            </div>
            <div className="text-xs text-faint">{headline.label}</div>
          </div>
        ) : (
          <span className="text-xs text-faint">No results reported</span>
        )}

        {headline ? <ProofBadge tier={headline.proofTier} /> : null}
      </div>

      <div className="mt-3 text-xs text-faint">
        by {playbook.author.name} · {playbook.readingMinutes} min read
      </div>
    </article>
  );
}
