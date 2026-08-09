import type { Funnel } from "@/lib/content/schema";
import { cn } from "@/lib/utils";

/**
 * One of the two components that carry the sharing loop: this ends up in OG
 * cards and in every screenshot anyone posts. It has to stay legible at ~600px
 * wide and in greyscale, which is why the benchmark is typographic weight
 * rather than colour, and why the stage index is always visible.
 */
export function FunnelDiagram({
  funnel,
  className,
}: {
  funnel: Funnel;
  className?: string;
}) {
  return (
    <figure className={cn("not-prose", className)}>
      <ol className="grid gap-3 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
        {funnel.stages.map((stage, i) => (
          <li key={stage.key} className="relative flex md:block">
            {/* Connector: a chevron between stages, direction follows layout. */}
            {i > 0 ? (
              <span
                aria-hidden="true"
                className="absolute -top-2.5 left-5 text-faint md:-left-2.5 md:top-1/2 md:-translate-y-1/2"
              >
                <svg
                  viewBox="0 0 12 12"
                  className="size-3 rotate-90 md:rotate-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            ) : null}

            <div className="flex h-full w-full flex-col rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-[11px] font-semibold text-muted">
                  {i + 1}
                </span>
                <h4 className="text-sm font-semibold leading-tight text-fg">{stage.label}</h4>
              </div>

              {stage.description ? (
                <p className="mt-2 text-xs leading-relaxed text-muted">{stage.description}</p>
              ) : null}

              {stage.benchmarkValue ? (
                <div className="mt-auto pt-3">
                  <div className="font-mono text-xl font-semibold tabular-nums text-fg">
                    {stage.benchmarkValue}
                  </div>
                  <div className="text-[11px] uppercase tracking-wide text-faint">
                    {stage.benchmarkLabel}
                  </div>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      <figcaption className="mt-3 text-xs text-faint">
        {funnel.name} · benchmarks are the author&rsquo;s reported figures, not guarantees
      </figcaption>
    </figure>
  );
}
