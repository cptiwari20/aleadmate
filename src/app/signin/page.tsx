"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, Container } from "@/components/ui/primitives";
import { authClient } from "@/lib/auth/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string>();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(undefined);

    const { error: authError } = await authClient.signIn.magicLink({
      email: email.trim().toLowerCase(),
      callbackURL: "/admin/waitlist",
    });

    if (authError) {
      setError(authError.message ?? "Could not send the link. Try again.");
      setStatus("idle");
      return;
    }

    setStatus("sent");
  }

  return (
    <Container className="flex min-h-dvh items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-accent font-mono text-sm font-bold text-accent-fg">
            a
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-fg">aLeadMate</span>
        </Link>

        <div className="rounded-2xl border border-border bg-surface p-6">
          {status === "sent" ? (
            <>
              <h1 className="text-lg font-semibold text-fg">Check your email</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                We sent a sign-in link to <span className="text-fg">{email}</span>. It
                expires in 10 minutes.
              </p>
              <p className="mt-4 text-xs text-faint">
                Running locally without <code className="font-mono">RESEND_API_KEY</code>?
                The link is printed in your dev server console.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-fg">Sign in</h1>
              <p className="mt-1 text-sm text-muted">
                No password. We email you a one-time link.
              </p>

              <form onSubmit={onSubmit} className="mt-5 space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"
                />

                {error ? (
                  <p role="alert" className="text-xs font-medium text-tier-unverified">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "sending"}
                  className="w-full"
                >
                  {status === "sending" ? "Sending…" : "Email me a link"}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-faint">
          <Link href="/" className="underline underline-offset-4 hover:text-muted">
            Back to aLeadMate
          </Link>
        </p>
      </div>
    </Container>
  );
}
