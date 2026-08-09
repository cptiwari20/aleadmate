"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Copying requires no account, ever. It's the strongest "this was useful"
 * signal we can collect from an anonymous reader, and gating it would trade a
 * measurable share loop for a handful of low-intent signups.
 */
export function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers and insecure origins: fall back to a hidden textarea.
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }

    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
        copied ? "text-accent-text" : "text-muted hover:bg-surface-2 hover:text-fg",
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
        {copied ? (
          <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
            <path d="M10.5 3.5H4A1.5 1.5 0 002.5 5v6.5" strokeLinecap="round" />
          </>
        )}
      </svg>
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
