import { ProofBadge } from "@/components/proof-badge";
import type { Result } from "@/lib/content/schema";
import { compactNumber, formatPeriod } from "@/lib/utils";

export function formatResultValue(result: Result): string {
  switch (result.unit) {
    case "percent":
      return `${result.value}%`;
    case "ratio":
      return `${result.value}x`;
    case "days":
      return `${result.value} ${result.value === 1 ? "day" : "days"}`;
    case "currency":
      return new Intl.NumberFormat("en", {
        style: "currency",
        currency: result.currency ?? "USD",
        maximumFractionDigits: 0,
      }).format(result.value);
    case "count":
    default:
      return compactNumber(result.value);
  }
}

/** The headline number for cards and OG images. */
export function primaryResult(results: Result[]): Result | null {
  if (results.length === 0) return null;
  const rank = { verified: 3, community: 2, unverified: 1 } as const;
  return [...results].sort(
    (a, b) =>
      (rank[b.proofTier as keyof typeof rank] ?? 0) -
        (rank[a.proofTier as keyof typeof rank] ?? 0) ||
      b.period.localeCompare(a.period),
  )[0];
}

export function ResultsPanel({ results }: { results: Result[] }) {
  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
        <p className="text-sm text-muted">No results reported yet.</p>
        <p className="mt-1 text-xs text-faint">
          Playbooks without results rank below those with them.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {results.map((result, i) => (
        <div key={`${result.label}-${i}`} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-mono text-2xl font-semibold tabular-nums text-fg">
                {formatResultValue(result)}
              </div>
              <div className="mt-0.5 text-sm text-muted">{result.label}</div>
            </div>
            <ProofBadge tier={result.proofTier} />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-2 text-xs text-faint">
            <span>{formatPeriod(result.period)}</span>
            {result.sampleSize ? <span>n = {compactNumber(result.sampleSize)}</span> : null}
            {result.proofUrl ? (
              <a
                href={result.proofUrl}
                rel="nofollow ugc noopener noreferrer"
                target="_blank"
                className="text-accent-text underline underline-offset-2"
              >
                Proof
              </a>
            ) : null}
          </div>

          {result.note ? <p className="mt-2 text-xs text-muted">{result.note}</p> : null}
        </div>
      ))}
    </div>
  );
}
