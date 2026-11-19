import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink, Container } from "@/components/ui/primitives";

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex size-7 items-center justify-center rounded-md bg-accent font-mono text-sm font-bold text-accent-fg">
        a
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-fg">aLeadMate</span>
    </Link>
  );
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
        <Container className="flex h-14 items-center justify-between gap-4">
          <Wordmark />
          <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-fg">
              How it works
            </a>
            <a href="#faq" className="transition-colors hover:text-fg">
              FAQ
            </a>
            <Link href="/library" className="transition-colors hover:text-fg">
              Playbook library
            </Link>
          </nav>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <ButtonLink href="#waitlist" size="sm">
              Get early access
            </ButtonLink>
          </div>
        </Container>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border bg-surface">
        <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Wordmark />
            <p className="mt-2 text-xs text-faint">
              An AI SDR for teams that need pipeline, not another dashboard.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <Link href="/library" className="transition-colors hover:text-fg">
              Playbook library
            </Link>
            <Link href="/standards" className="transition-colors hover:text-fg">
              Standards
            </Link>
            <a href="#waitlist" className="transition-colors hover:text-fg">
              Join the waitlist
            </a>
          </nav>
        </Container>
      </footer>
    </>
  );
}
