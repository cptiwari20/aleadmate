import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Guard for fetching a visitor-supplied URL from our own server.
 *
 * Without this, anyone could type an internal address into the hero input and
 * use our server to read it — cloud metadata endpoints, private subnets, admin
 * panels. The URL is checked, then every DNS answer behind it is checked, and
 * redirects are re-checked hop by hop (see fetchSite).
 */

export type UrlCheck = { ok: true; url: URL } | { ok: false; reason: string };

/** Accepts "acme.com", "www.acme.com/path", "https://acme.com". */
export function normalizeWebsiteInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function ipv4Blocked(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  const [a, b] = p;

  if (a === 0 || a === 127) return true; // this host / loopback
  if (a === 10) return true; // private
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier NAT
  if (a === 192 && b === 0) return true; // protocol assignments
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a >= 224) return true; // multicast and reserved
  return false;
}

function ipv6Blocked(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::" || normalized === "::1") return true;

  // IPv4-mapped (::ffff:10.0.0.1) must be judged by its IPv4 rules.
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(normalized);
  if (mapped) return ipv4Blocked(mapped[1]);

  if (/^f[cd]/.test(normalized)) return true; // unique local
  if (/^fe[89ab]/.test(normalized)) return true; // link-local
  return false;
}

function addressBlocked(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return ipv4Blocked(ip);
  if (version === 6) return ipv6Blocked(ip);
  return true;
}

export async function checkPublicUrl(input: string): Promise<UrlCheck> {
  let url: URL;
  try {
    url = new URL(normalizeWebsiteInput(input));
  } catch {
    return { ok: false, reason: "That doesn't look like a web address." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "Only http and https addresses work here." };
  }

  const host = url.hostname.toLowerCase();

  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return { ok: false, reason: "That address isn't reachable from the internet." };
  }

  // A bare IP is allowed only if it is a public one.
  if (isIP(host) && addressBlocked(host)) {
    return { ok: false, reason: "That address isn't reachable from the internet." };
  }

  if (!isIP(host)) {
    if (!host.includes(".")) {
      return { ok: false, reason: "That doesn't look like a web address." };
    }
    try {
      const records = await lookup(host, { all: true });
      if (records.length === 0 || records.some((r) => addressBlocked(r.address))) {
        return { ok: false, reason: "That address isn't reachable from the internet." };
      }
    } catch {
      return { ok: false, reason: "We couldn't find that domain." };
    }
  }

  return { ok: true, url };
}

export { addressBlocked };
