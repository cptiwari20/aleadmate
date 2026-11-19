import { cn } from "@/lib/utils";

/**
 * Mate — the AI SDR persona.
 *
 * Drawn rather than illustrated so it inherits the brand tokens, stays crisp at
 * any size, and costs no image payload. The headset is deliberate: it reads as
 * "sales rep" before it reads as "robot", which is the whole point of the
 * character.
 *
 * Flat fills with CSS variables instead of SVG gradients, so the avatar can be
 * rendered from a server component without needing unique gradient ids.
 */
export function MateAvatar({
  size = 48,
  busy = false,
  className,
}: {
  size?: number;
  /** Adds the orbiting activity ring used when Mate is working. */
  busy?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {busy ? (
        <span
          aria-hidden="true"
          className="anim-orbit absolute inset-0 rounded-full border border-dashed border-accent/40"
        />
      ) : null}

      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        role="img"
        aria-label="Mate, the aLeadMate AI SDR"
        className="relative"
      >
        {/* Halo */}
        <circle cx="32" cy="32" r="31" fill="var(--accent-soft)" />

        {/* Headset band */}
        <path
          d="M13 34a19 19 0 0 1 38 0"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Head */}
        <rect x="15" y="20" width="34" height="32" rx="13" fill="var(--brand)" />

        {/* Ear cups */}
        <rect x="8" y="30" width="9" height="15" rx="4.5" fill="var(--accent)" />
        <rect x="47" y="30" width="9" height="15" rx="4.5" fill="var(--accent)" />

        {/* Mic boom */}
        <path
          d="M51.5 45c0 6-4.5 9.5-9.5 10.5"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="40" cy="56" r="3.2" fill="var(--accent)" />

        {/* Eyes */}
        <g className="anim-blink">
          <rect x="24" y="31" width="5" height="8" rx="2.5" fill="var(--accent-text)" />
          <rect x="35" y="31" width="5" height="8" rx="2.5" fill="var(--accent-text)" />
        </g>

        {/* Smile */}
        <path
          d="M27 44.5c1.6 1.6 3.4 2.4 5 2.4s3.4-.8 5-2.4"
          fill="none"
          stroke="var(--accent-text)"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>
    </span>
  );
}

/** Small inline "Mate is doing X" status line. */
export function MateStatus({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <MateAvatar size={22} />
      <span className="text-xs text-muted">{children}</span>
    </span>
  );
}
