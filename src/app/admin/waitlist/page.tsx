import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, Container, Eyebrow, Stat } from "@/components/ui/primitives";
import { requireAdmin } from "@/lib/auth/admin";
import { isDatabaseConfigured } from "@/lib/env";
import {
  BUDGET_PER_LEAD,
  LEADS_PER_MONTH,
  LEAD_TYPES,
} from "@/lib/waitlist/schema";
import { listSignups, summarise } from "@/lib/waitlist/query";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Waitlist",
  robots: { index: false, follow: false },
};

const labelOf = (options: readonly { value: string; label: string }[], value?: string | null) =>
  options.find((o) => o.value === value)?.label ?? value ?? "—";

function Gate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Container className="flex min-h-dvh items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center">
        <h1 className="text-lg font-semibold text-fg">{title}</h1>
        <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </Container>
  );
}

export default async function AdminWaitlistPage() {
  const access = await requireAdmin();

  if (!access.ok) {
    if (access.reason === "unconfigured") {
      return (
        <Gate title="Admin access is not configured">
          <p>
            Set <code className="font-mono text-fg">ADMIN_EMAILS</code> in your
            environment to a comma-separated list of addresses, then reload.
          </p>
        </Gate>
      );
    }

    if (access.reason === "signed-out") {
      return (
        <Gate title="Sign in to continue">
          <p>This page is for the aLeadMate team.</p>
          <ButtonLink href="/signin" className="mt-5">
            Sign in
          </ButtonLink>
        </Gate>
      );
    }

    return (
      <Gate title="Not an admin">
        <p>
          Your account is signed in but not on the admin allowlist.{" "}
          <Link href="/" className="text-accent-text underline underline-offset-4">
            Back to the site
          </Link>
          .
        </p>
      </Gate>
    );
  }

  if (!isDatabaseConfigured()) {
    return (
      <Gate title="No database configured">
        <p>
          Set <code className="font-mono text-fg">DATABASE_URL</code> and run{" "}
          <code className="font-mono text-fg">npm run db:push</code>. Until then,
          local signups are written to{" "}
          <code className="font-mono text-fg">.waitlist-local.jsonl</code>.
        </p>
      </Gate>
    );
  }

  const [rows, summary] = await Promise.all([listSignups(), summarise()]);

  return (
    <Container className="py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Admin</Eyebrow>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
            Waitlist signups
          </h1>
          <p className="mt-1 text-sm text-faint">Signed in as {access.email}</p>
        </div>
        <ButtonLink href="/admin/waitlist/export" variant="outline" size="sm">
          Download CSV
        </ButtonLink>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-6 border-y border-border py-5 sm:grid-cols-4">
        <Stat value={String(summary.total)} label="Total signups" />
        <Stat
          value={String(summary.qualified)}
          label="Completed step 2"
          hint={
            summary.total > 0
              ? `${Math.round((summary.qualified / summary.total) * 100)}% completion`
              : undefined
          }
        />
        <Stat value={String(summary.total - summary.qualified)} label="Contact only" />
        <Stat value={String(summary.last7Days)} label="Last 7 days" />
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted">
          No signups yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[60rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-faint">
                <th className="py-2 pr-4 font-semibold">Contact</th>
                <th className="py-2 pr-4 font-semibold">Business</th>
                <th className="py-2 pr-4 font-semibold">Wants</th>
                <th className="py-2 pr-4 font-semibold">Location</th>
                <th className="py-2 pr-4 font-semibold">Budget</th>
                <th className="py-2 pr-4 font-semibold">Volume</th>
                <th className="py-2 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border align-top">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-fg">{row.name}</div>
                    <div className="text-xs text-faint">{row.email}</div>
                    <div className="text-xs text-faint">{row.phone}</div>
                    {row.stage === "CONTACT" ? (
                      <span className="mt-1 inline-block rounded bg-tier-unverified-soft px-1.5 py-0.5 text-[11px] font-medium text-tier-unverified">
                        Step 1 only
                      </span>
                    ) : null}
                  </td>
                  <td className="max-w-[16rem] py-3 pr-4 text-muted">{row.business ?? "—"}</td>
                  <td className="max-w-[14rem] py-3 pr-4 text-muted">
                    {row.leadTypes.length > 0
                      ? row.leadTypes.map((t) => labelOf(LEAD_TYPES, t)).join(", ")
                      : "—"}
                    {row.leadTypeOther ? (
                      <div className="text-xs text-faint">{row.leadTypeOther}</div>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4 text-muted">{row.location ?? "—"}</td>
                  <td className="py-3 pr-4 text-muted">
                    {labelOf(BUDGET_PER_LEAD, row.budgetPerLead)}
                  </td>
                  <td className="py-3 pr-4 text-muted">
                    {labelOf(LEADS_PER_MONTH, row.leadsPerMonth)}
                  </td>
                  <td className="py-3 whitespace-nowrap text-faint">
                    {row.createdAt.toISOString().slice(0, 10)}
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
