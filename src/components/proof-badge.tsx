import { proofTierBySlug, type ProofTierSlug } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const styles: Record<ProofTierSlug, string> = {
  verified: "bg-tier-verified-soft text-tier-verified",
  community: "bg-tier-community-soft text-tier-community",
  unverified: "bg-tier-unverified-soft text-tier-unverified",
};

const dots: Record<ProofTierSlug, number> = {
  verified: 3,
  community: 2,
  unverified: 1,
};

/**
 * The three tiers must never look interchangeable — colour alone isn't enough
 * (it fails for colour-blind readers and in greyscale screenshots), so the
 * filled-dot count carries the same information redundantly.
 */
export function ProofBadge({
  tier,
  className,
}: {
  tier: string;
  className?: string;
}) {
  const meta = proofTierBySlug(tier);
  if (!meta) return null;
  const key = meta.slug;

  return (
    <span
      title={meta.blurb}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        styles[key],
        className,
      )}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "size-1.5 rounded-full",
              i < dots[key] ? "bg-current" : "bg-current opacity-25",
            )}
          />
        ))}
      </span>
      {meta.label}
    </span>
  );
}
