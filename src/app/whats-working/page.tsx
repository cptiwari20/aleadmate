import type { Metadata } from "next";
import Link from "next/link";
import { ProofBadge } from "@/components/proof-badge";
import { formatResultValue } from "@/components/results-panel";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { loadPlaybooks } from "@/lib/content/loader";
import type { Result } from "@/lib/content/schema";
import { compactNumber, formatPeriod } from "@/lib/utils";

export const metadata: Metadata = {
  title: "What's working now",
  description:
    "Every result reported across the aLeadMate library, newest first, with proof tier and sample size.",
  alternates: { canonical: "/whats-working" },
};

type Row = Result & { playbookSlug: string; playbookTitle: string };

export default async function WhatsWorkingPage() {
  const playbooks = await loadPlaybooks();

  const rows: Row[] = playbooks
    .flatMap((p) =>
      p.results.map((r) => ({ ...r, playbookSlug: p.slug, playbookTitle: p.title })),
    )
    .sort((a, b) => b.period.localeCompare(a.period));

  return (
    <Container className="py-12">
      <div className="max-w-2xl">
        <Eyebrow>Live across the library</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg">
          What&rsquo;s working now
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Every reported result, newest first. Self-reported numbers are labelled as such
          &mdash; the spread matters more than any single figure.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted">
          No results reported yet.
        </p>
      ) : (
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-faint">
                <th className="py-2 pr-4 font-semibold">Result</th>
                <th className="py-2 pr-4 font-semibold">Playbook</th>
                <th className="py-2 pr-4 font-semibold">Sample</th>
                <th className="py-2 pr-4 font-semibold">Period</th>
                <th className="py-2 font-semibold">Proof</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={`${row.playbookSlug}-${i}`} className="border-b border-border">
                  <td className="py-3 pr-4">
                    <span className="font-mono font-semibold tabular-nums text-fg">
                      {formatResultValue(row)}
                    </span>{" "}
                    <span className="text-muted">{row.label}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/p/${row.playbookSlug}`}
                      className="text-accent-text underline-offset-4 hover:underline"
                    >
                      {row.playbookTitle}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-faint">
                    {row.sampleSize ? `n = ${compactNumber(row.sampleSize)}` : "—"}
                  </td>
                  <td className="py-3 pr-4 text-faint">{formatPeriod(row.period)}</td>
                  <td className="py-3">
                    <ProofBadge tier={row.proofTier} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
