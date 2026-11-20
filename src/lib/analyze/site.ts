import "server-only";
import { checkPublicUrl } from "@/lib/analyze/url";

/**
 * Reads the public surface of a visitor's website: what it calls itself and
 * how it describes itself. Nothing is inferred or invented here — whatever we
 * show the visitor is text their own site served us.
 */

const TIMEOUT_MS = 7000;
const MAX_BYTES = 512 * 1024;
const MAX_REDIRECTS = 3;

/** Generic, no project or personal details. */
const USER_AGENT = "aLeadMateBot/1.0 (+https://www.aleadmate.com)";

export type SiteRead = {
  url: string;
  host: string;
  title: string | null;
  description: string | null;
  siteName: string | null;
  heading: string | null;
};

export type SiteResult = { ok: true; site: SiteRead } | { ok: false; reason: string };

function decodeEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function clean(value: string | undefined, max = 220): string | null {
  if (!value) return null;
  const text = decodeEntities(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function metaContent(html: string, attr: "name" | "property", key: string): string | undefined {
  const pattern = new RegExp(
    `<meta[^>]+${attr}\\s*=\\s*["']${key}["'][^>]*>`,
    "i",
  );
  const tag = pattern.exec(html)?.[0];
  if (!tag) return undefined;
  return /content\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1];
}

/** Follows redirects manually so every hop is re-validated against the guard. */
async function fetchFollowing(start: URL): Promise<Response> {
  let current = start;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*;q=0.8" },
    });

    if (response.status < 300 || response.status >= 400) return response;

    const location = response.headers.get("location");
    if (!location) return response;

    const next = new URL(location, current);
    const check = await checkPublicUrl(next.toString());
    if (!check.ok) throw new Error("redirect blocked");
    current = check.url;
  }

  throw new Error("too many redirects");
}

export async function readSite(input: string): Promise<SiteResult> {
  const check = await checkPublicUrl(input);
  if (!check.ok) return { ok: false, reason: check.reason };

  let response: Response;
  try {
    response = await fetchFollowing(check.url);
  } catch {
    return { ok: false, reason: "We couldn't reach that site just now." };
  }

  if (!response.ok) {
    return { ok: false, reason: `That site answered with a ${response.status}.` };
  }

  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("html")) {
    return { ok: false, reason: "That address didn't return a web page." };
  }

  // Read with a hard cap: a huge or endless body must not tie up the server.
  const reader = response.body?.getReader();
  if (!reader) return { ok: false, reason: "We couldn't read that site." };

  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      chunks.push(value);
      total += value.byteLength;
      if (total >= MAX_BYTES) break;
    }
  } catch {
    return { ok: false, reason: "We couldn't read that site." };
  } finally {
    await reader.cancel().catch(() => {});
  }

  const html = new TextDecoder("utf-8", { fatal: false }).decode(
    chunks.length === 1 ? chunks[0] : Buffer.concat(chunks.map((c) => Buffer.from(c))),
  );

  const site: SiteRead = {
    url: check.url.toString(),
    host: check.url.hostname.replace(/^www\./, ""),
    title: clean(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1], 120),
    description:
      clean(metaContent(html, "name", "description")) ??
      clean(metaContent(html, "property", "og:description")),
    siteName: clean(metaContent(html, "property", "og:site_name"), 80),
    heading: clean(/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1], 120),
  };

  if (!site.title && !site.description && !site.heading) {
    return { ok: false, reason: "We couldn't read anything useful from that page." };
  }

  return { ok: true, site };
}
