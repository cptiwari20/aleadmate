import { CopyButton } from "@/components/copy-button";
import { Tag } from "@/components/ui/primitives";
import type { Flow, Play } from "@/lib/content/schema";
import { playKindBySlug } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

function dayLabel(day: number) {
  return day === 0 ? "Day 0" : `Day ${day}`;
}

/** What actually lands on the clipboard: hook + body, nothing else. */
function playToText(play: Play) {
  return play.hook ? `${play.hook}\n\n${play.body}` : play.body;
}

function PlayCard({ play }: { play: Play }) {
  const kind = playKindBySlug(play.kind);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-2 px-4 py-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-fg">{play.name}</h4>
          {kind ? <Tag>{kind.label}</Tag> : null}
        </div>
        <CopyButton text={playToText(play)} />
      </div>

      <div className="px-4 py-3">
        {play.hook ? (
          <p className="mb-2 border-l-2 border-accent pl-3 text-sm font-medium text-fg">
            {play.hook}
          </p>
        ) : null}

        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-muted">
          {play.body}
        </pre>

        {play.variables.length > 0 ? (
          <dl className="mt-3 grid gap-1.5 border-t border-border pt-3">
            {play.variables.map((v) => (
              <div key={v.token} className="flex flex-wrap items-baseline gap-x-2 text-xs">
                <dt className="font-mono text-accent-text">{v.token}</dt>
                <dd className="text-faint">
                  {v.description}
                  {v.example ? <span className="italic"> — e.g. {v.example}</span> : null}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {play.rationale ? (
          <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-faint">
            <span className="font-semibold text-muted">Why it works — </span>
            {play.rationale}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The second screenshot-critical component. The vertical rail with day markers
 * is the thing that reads instantly as "a sequence, with timing" — which is
 * exactly what a PDF swipe file can't show.
 */
export function FlowTimeline({ flow, className }: { flow: Flow; className?: string }) {
  return (
    <section className={cn("not-prose", className)}>
      <header className="mb-4">
        <h3 className="text-lg font-semibold text-fg">{flow.name}</h3>
        <p className="mt-1 text-sm text-muted">{flow.goal}</p>
      </header>

      <ol className="relative space-y-4 border-l border-border pl-6">
        {flow.steps.map((step, i) => (
          <li key={step.play.slug} className="relative">
            <span className="absolute -left-[1.6875rem] top-1 flex size-4 items-center justify-center rounded-full border border-border bg-bg">
              <span className="size-1.5 rounded-full bg-accent" />
            </span>

            <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-mono text-xs font-semibold text-fg">{dayLabel(step.day)}</span>
              <span className="text-xs text-faint">Step {i + 1}</span>
              {step.condition ? (
                <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted">
                  if {step.condition}
                </span>
              ) : null}
            </div>

            <PlayCard play={step.play} />
          </li>
        ))}
      </ol>

      {flow.exitCriteria.length > 0 ? (
        <div className="mt-4 rounded-xl border border-border bg-surface-2 px-4 py-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Stop the sequence when
          </h4>
          <ul className="mt-2 space-y-1">
            {flow.exitCriteria.map((c) => (
              <li key={c} className="flex gap-2 text-sm text-muted">
                <span aria-hidden="true" className="text-faint">
                  &bull;
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
