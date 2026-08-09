export const site = {
  name: "aLeadMate",
  tagline: "The open library of lead-gen playbooks that actually worked.",
  description:
    "Free, forkable lead-generation playbooks with real, dated results attached. No login to read. No login to copy.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString();
}
