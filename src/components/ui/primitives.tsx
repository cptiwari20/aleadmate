import Link, { type LinkProps } from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

const buttonVariants = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  secondary: "bg-surface-2 text-fg hover:bg-border",
  outline: "border border-border-strong bg-surface text-fg hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
} as const;

const buttonSizes = {
  sm: "h-8 px-3",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-base",
} as const;

type ButtonStyleProps = {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export function buttonClass({ variant = "primary", size = "md" }: ButtonStyleProps = {}) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size]);
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonStyleProps & ComponentPropsWithoutRef<"button">) {
  return <button className={cn(buttonClass({ variant, size }), className)} {...props} />;
}

/**
 * Generic over the route type so `typedRoutes` keeps checking hrefs through the
 * wrapper. Pinning it to a plain `string` would silently disable link checking
 * across the whole site.
 */
export function ButtonLink<RouteType>({
  variant,
  size,
  className,
  ...props
}: ButtonStyleProps & LinkProps<RouteType>) {
  return <Link className={cn(buttonClass({ variant, size }), className)} {...props} />;
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>{children}</div>
  );
}

export function Tag({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function TagLink<RouteType>({
  href,
  children,
}: {
  href: LinkProps<RouteType>["href"];
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted transition-colors hover:bg-border hover:text-fg"
    >
      {children}
    </Link>
  );
}

/** Small label above a section heading. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">{children}</p>
  );
}

export function Stat({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="font-mono text-2xl font-semibold tabular-nums text-fg">{value}</div>
      <div className="mt-0.5 text-sm text-muted">{label}</div>
      {hint ? <div className="mt-0.5 text-xs text-faint">{hint}</div> : null}
    </div>
  );
}
