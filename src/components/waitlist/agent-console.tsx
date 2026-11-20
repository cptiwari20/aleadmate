"use client";

import { useEffect, useRef, useState } from "react";
import { MateAvatar } from "@/components/brand/mate";
import { cn } from "@/lib/utils";

/**
 * Product illustration, not data. Every company here is invented — a hero mock
 * full of plausible real contacts would read as a fabricated record, which the
 * project rules out on purpose.
 */
type Scenario = {
  query: string;
  rows: { company: string; contact: string; title: string; city: string }[];
  stats: { found: string; verified: string; sequenced: string };
};

const SCENARIOS: Scenario[] = [
  {
    query: "dental clinics in Austin with 5+ staff",
    rows: [
      { company: "Brightleaf Dental", contact: "M. Okonjo", title: "Practice Manager", city: "Austin, TX" },
      { company: "Cedar Park Smiles", contact: "R. Vance", title: "Owner", city: "Cedar Park, TX" },
      { company: "Lakeline Family Dental", contact: "S. Reyes", title: "Office Director", city: "Austin, TX" },
      { company: "Hill Country Ortho", contact: "D. Whitfield", title: "Founder", city: "Round Rock, TX" },
    ],
    stats: { found: "142", verified: "128", sequenced: "86" },
  },
  {
    query: "Shopify brands that just raised a seed round",
    rows: [
      { company: "Fernway Goods", contact: "A. Lindqvist", title: "Head of Growth", city: "Portland, OR" },
      { company: "Saltmarsh Supply", contact: "J. Okafor", title: "Co-founder", city: "Brooklyn, NY" },
      { company: "Tidewater Home", contact: "P. Marchetti", title: "CMO", city: "Austin, TX" },
      { company: "Northbeam Outdoors", contact: "K. Sørensen", title: "VP Ecommerce", city: "Denver, CO" },
    ],
    stats: { found: "318", verified: "291", sequenced: "174" },
  },
  {
    query: "agencies hiring their first SDR right now",
    rows: [
      { company: "Fieldnote Studio", contact: "T. Abara", title: "Managing Partner", city: "London, UK" },
      { company: "Overlook Creative", contact: "L. Ferreira", title: "Founder", city: "Lisbon, PT" },
      { company: "Granite & Co.", contact: "H. Nakamura", title: "Ops Lead", city: "Toronto, CA" },
      { company: "Rowan Digital", contact: "E. Dlamini", title: "CEO", city: "Cape Town, ZA" },
    ],
    stats: { found: "96", verified: "88", sequenced: "61" },
  },
];

const STEPS = ["Searching sources", "Verifying emails", "Writing first touches", "Scheduling follow-ups"];

function useRotatingQuery() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(SCENARIOS[0].query.length);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced.current) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const run = (scenario: number, chars: number) => {
      if (cancelled) return;
      const query = SCENARIOS[scenario].query;

      if (chars <= query.length) {
        setTyped(chars);
        timer = setTimeout(() => run(scenario, chars + 1), 34);
        return;
      }

      // Hold the finished query, then move to the next one.
      timer = setTimeout(() => {
        if (cancelled) return;
        const next = (scenario + 1) % SCENARIOS.length;
        setIndex(next);
        run(next, 0);
      }, 3200);
    };

    setTyped(0);
    run(0, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const scenario = SCENARIOS[index];
  return { scenario, text: scenario.query.slice(0, typed), done: typed >= scenario.query.length };
}

function initials(company: string) {
  return company
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function AgentConsole() {
  const { scenario, text, done } = useRotatingQuery();

  return (
    <div className="ring-gradient relative min-w-0 overflow-hidden rounded-2xl border border-border bg-surface/80 shadow-2xl backdrop-blur">
      {/* Search bar */}
      <div className="relative flex items-center gap-2.5 border-b border-border bg-surface-2/60 px-4 py-3">
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

        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-fg">
          {text}
          <span className={cn("ml-0.5 text-accent", !done && "anim-caret")} aria-hidden="true">
            |
          </span>
        </span>

        <span className="hidden shrink-0 rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-accent-fg sm:block">
          Find leads
        </span>
      </div>

      {/* Agent step strip */}
      <div className="relative flex items-center gap-3 overflow-hidden border-b border-border bg-surface/60 px-4 py-2.5">
        <MateAvatar size={24} busy />
        <div className="flex min-w-0 items-center gap-x-3 overflow-hidden">
          {STEPS.map((step, i) => (
            <span key={step} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[10px] text-muted">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  i < 3 ? "bg-accent" : "bg-accent/40 anim-pulse-ring",
                )}
              />
              {step}
            </span>
          ))}
        </div>
        {/* Light sweep, so the panel reads as actively working. */}
        <span
          aria-hidden="true"
          className="anim-sweep pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-accent/10 to-transparent"
        />
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-[1fr_auto]">
        {/* Results */}
        <div className="bg-surface">
          {scenario.rows.map((row, i) => (
            <div
              key={`${scenario.query}-${row.company}`}
              className="anim-fade-up flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent-soft font-mono text-[10px] font-bold text-accent-text">
                {initials(row.company)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-fg">{row.company}</div>
                <div className="truncate text-[11px] text-faint">
                  {row.contact} · {row.title} · {row.city}
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold",
                  i === 3
                    ? "bg-tier-unverified-soft text-tier-unverified"
                    : "bg-tier-community-soft text-tier-community",
                )}
              >
                {i === 3 ? "Checking" : "Verified"}
              </span>
            </div>
          ))}
        </div>

        {/* Counters */}
        <div className="flex gap-6 bg-surface px-4 py-3 sm:w-40 sm:flex-col sm:gap-4">
          {(
            [
              ["Found", scenario.stats.found],
              ["Verified", scenario.stats.verified],
              ["Sequenced", scenario.stats.sequenced],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="anim-fade-up" style={{ animationDelay: "120ms" }}>
              <div className="font-mono text-xl font-semibold tabular-nums text-fg">{value}</div>
              <div className="text-[10px] uppercase tracking-wider text-faint">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="border-t border-border bg-surface-2/60 px-4 py-2 text-[10px] text-faint">
        Interface illustration. Companies shown are fictional.
      </p>
    </div>
  );
}
