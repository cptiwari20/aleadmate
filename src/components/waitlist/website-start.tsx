"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { analyzeWebsite } from "@/app/(marketing)/actions";
import { MateAvatar } from "@/components/brand/mate";
import { Button } from "@/components/ui/primitives";
import { useWebsite } from "@/components/waitlist/website-context";
import type { SiteRead } from "@/lib/analyze/site";
import { cn } from "@/lib/utils";

const STAGES = [
  "Reading your site",
  "Working out what you sell",
  "Shortlisting who buys it",
  "Preparing your first search",
];

export function WebsiteStart() {
  const { setSite: publish } = useWebsite();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [site, setSite] = useState<SiteRead | null>(null);
  const [stage, setStage] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  // Advances only while a read is in flight. The reset lives in the submit
  // handler so this effect never sets state synchronously.
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(
      () => setStage((s) => Math.min(s + 1, STAGES.length - 1)),
      900,
    );
    return () => clearInterval(timer);
  }, [pending]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStage(0);
    setPending(true);
    setError(undefined);
    setSite(null);

    const result = await analyzeWebsite(value);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSite(result.site);
    publish(result.site);
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  }

  function skip() {
    setSite(null);
    setError(undefined);
    publish(null);
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-2.5 sm:flex-row">
        <div className="ring-gradient relative flex-1 rounded-xl">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="yourcompany.com"
            autoComplete="url"
            inputMode="url"
            aria-label="Your website address"
            className="w-full rounded-xl border border-border bg-surface/80 px-4 py-3.5 text-[15px] text-fg backdrop-blur placeholder:text-faint focus:border-accent focus:outline-none"
          />
        </div>
        <Button type="submit" size="lg" disabled={pending} className="shrink-0 sm:px-7">
          {pending ? "Reading…" : "Find my leads"}
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <button
          type="button"
          onClick={skip}
          className="text-faint underline underline-offset-4 transition-colors hover:text-muted"
        >
          I don&rsquo;t have a website
        </button>
        {error ? (
          <span role="alert" className="font-medium text-tier-unverified">
            {error}
          </span>
        ) : (
          <span className="text-faint">Free. No account, no card.</span>
        )}
      </div>

      {/* Progress while reading */}
      {pending ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface/70 p-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <MateAvatar size={32} busy />
            <span className="text-sm font-medium text-fg">Mate is taking a look…</span>
          </div>
          <ul className="mt-4 space-y-2">
            {STAGES.map((label, i) => (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-2.5 text-sm transition-colors",
                  i < stage ? "text-muted" : i === stage ? "text-fg" : "text-faint/60",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border",
                    i < stage
                      ? "border-accent bg-accent text-accent-fg"
                      : i === stage
                        ? "border-accent anim-pulse-ring"
                        : "border-border",
                  )}
                >
                  {i < stage ? (
                    <svg viewBox="0 0 20 20" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M4 10.5l4 4 8-8.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* What we actually read */}
      {site && !pending ? (
        <div
          ref={resultRef}
          className="ring-gradient anim-fade-up mt-6 rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur"
        >
          <div className="flex items-center gap-3">
            <MateAvatar size={32} />
            <div>
              <p className="text-sm font-semibold text-fg">
                Here&rsquo;s what Mate read on {site.host}
              </p>
              <p className="text-xs text-faint">Straight from your site — nothing invented.</p>
            </div>
          </div>

          <dl className="mt-4 space-y-3 border-t border-border pt-4">
            {site.siteName ? (
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-faint">Business</dt>
                <dd className="mt-0.5 text-sm text-fg">{site.siteName}</dd>
              </div>
            ) : null}
            {site.title ? (
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-faint">Positioning</dt>
                <dd className="mt-0.5 text-sm text-fg">{site.title}</dd>
              </div>
            ) : null}
            {site.description ?? site.heading ? (
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-faint">What you do</dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-muted">
                  {site.description ?? site.heading}
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-5 rounded-xl bg-surface-2/70 p-4">
            <p className="text-sm leading-relaxed text-muted">
              <span className="font-medium text-fg">Next, on your invitation:</span> Mate
              researches your competitors, builds a ranked list of who actually buys this,
              finds the named decision-makers with verified emails, and writes the first
              touch.
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            className="mt-4 w-full"
            onClick={() =>
              document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Claim my invitation
          </Button>
        </div>
      ) : null}
    </div>
  );
}
