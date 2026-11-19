import { ImageResponse } from "next/og";
import { formatResultValue, primaryResult } from "@/components/results-panel";
import { getPlaybook, getPlaybookSlugs } from "@/lib/content/loader";
import { channelBySlug, proofTierBySlug } from "@/lib/taxonomy";
import { compactNumber, formatPeriod } from "@/lib/utils";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "aLeadMate playbook";

export async function generateStaticParams() {
  return (await getPlaybookSlugs()).map((slug) => ({ slug }));
}

/**
 * On LinkedIn and X the share card *is* the click-through rate, so the headline
 * metric gets more pixels than the title. Satori only supports flexbox — no
 * grid, no shorthand gaps on non-flex parents.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playbook = await getPlaybook(slug);

  if (!playbook) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#16191b",
            color: "#f5f7f6",
            fontSize: 48,
          }}
        >
          aLeadMate
        </div>
      ),
      size,
    );
  }

  const channel = channelBySlug(playbook.channel);
  const headline = primaryResult(playbook.results);
  const tier = headline ? proofTierBySlug(headline.proofTier) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#16191b",
          padding: 64,
          fontFamily: "sans-serif",
          color: "#f5f7f6",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#4ade80",
              color: "#0f1f16",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            a
          </div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>aLeadMate</div>
          {channel ? (
            <div
              style={{
                display: "flex",
                marginLeft: 8,
                padding: "6px 14px",
                borderRadius: 8,
                background: "#252a2c",
                color: "#a9b3b0",
                fontSize: 20,
              }}
            >
              {channel.label}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: playbook.title.length > 70 ? 52 : 62,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: 1000,
            }}
          >
            {playbook.title}
          </div>

          {headline ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: 36 }}>
              <div style={{ fontSize: 84, fontWeight: 700, color: "#4ade80", lineHeight: 1 }}>
                {formatResultValue(headline)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", paddingBottom: 8 }}>
                <div style={{ fontSize: 26, color: "#d3dad7" }}>{headline.label}</div>
                {/* Satori requires explicit flex on any node with more than one
                    child, so this line is assembled as a single string. */}
                <div style={{ fontSize: 20, color: "#8b9491", marginTop: 4 }}>
                  {[
                    tier?.label,
                    headline.sampleSize ? `n = ${compactNumber(headline.sampleSize)}` : null,
                    formatPeriod(headline.period),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#8b9491",
          }}
        >
          <div style={{ display: "flex" }}>by {playbook.author.name}</div>
          <div style={{ display: "flex" }}>Free to read · free to fork</div>
        </div>
      </div>
    ),
    size,
  );
}
