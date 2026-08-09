import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** `1240` -> `1.2k`. Used for fork counts and sample sizes. */
export function compactNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (Math.abs(n) < 1000) return String(n);
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** `2026-03` -> `Mar 2026`. Results carry a period, never a bare "recently". */
export function formatPeriod(period: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return period;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return date.toLocaleDateString("en", { month: "short", year: "numeric" });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
