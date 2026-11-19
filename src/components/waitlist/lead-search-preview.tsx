import { cn } from "@/lib/utils";

/**
 * Product illustration, not data. Every company below is invented — the plan
 * rules out anything that could read as a fabricated real record, and a hero
 * mock full of plausible real contacts is exactly that.
 */
const ROWS = [
  { company: "Brightleaf Dental", contact: "M. Okonjo", title: "Practice Manager", city: "Austin, TX", verified: true },
  { company: "Cedar Park Smiles", contact: "R. Vance", title: "Owner", city: "Cedar Park, TX", verified: true },
  { company: "Lakeline Family Dental", contact: "S. Reyes", title: "Office Director", city: "Austin, TX", verified: true },
  { company: "Hill Country Ortho", contact: "D. Whitfield", title: "Founder", city: "Round Rock, TX", verified: false },
];

const STATS = [
  { label: "Found", value: "142" },
  { label: "Verified", value: "128" },
  { label: "Sequenced", value: "86" },
];

export function LeadSearchPreview() {
  return (
    <div
      aria-label="Illustration of the aLeadMate lead search interface"
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
    >
      {/* Search bar */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-3">
        <svg
          viewBox="0 0 16 16"
          className="size-4 shrink-0 text-faint"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L14 14" strokeLinecap="round" />
        </svg>
        <span className="truncate text-sm text-fg">
          dental clinics in Austin with 5+ staff
        </span>
        <span className="ml-auto hidden shrink-0 rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-fg sm:block">
          Find leads
        </span>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-[1fr_auto]">
        {/* Results */}
        <div className="bg-surface">
          {ROWS.map((row) => (
            <div
              key={row.company}
              className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-fg">{row.company}</div>
                <div className="truncate text-xs text-faint">
                  {row.contact} · {row.title} · {row.city}
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium",
                  row.verified
                    ? "bg-tier-community-soft text-tier-community"
                    : "bg-tier-unverified-soft text-tier-unverified",
                )}
              >
                {row.verified ? "Verified" : "Checking"}
              </span>
            </div>
          ))}
        </div>

        {/* Agent rail */}
        <div className="flex gap-6 bg-surface px-4 py-3 sm:w-44 sm:flex-col sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" />
            <span className="text-xs font-medium text-fg">Agent running</span>
          </div>
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="font-mono text-lg font-semibold tabular-nums text-fg">
                {stat.value}
              </div>
              <div className="text-[11px] uppercase tracking-wide text-faint">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="border-t border-border bg-surface-2 px-4 py-2 text-[11px] text-faint">
        Interface illustration. Companies shown are fictional.
      </p>
    </div>
  );
}
