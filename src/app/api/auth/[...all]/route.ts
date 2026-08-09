import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

/**
 * Resolved per-request rather than at module scope: the public library builds
 * and deploys without auth env vars, and importing this route must not be what
 * breaks that.
 */
export async function GET(request: Request) {
  return toNextJsHandler(getAuth()).GET(request);
}

export async function POST(request: Request) {
  return toNextJsHandler(getAuth()).POST(request);
}
