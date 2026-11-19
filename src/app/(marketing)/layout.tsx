import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink, Container } from "@/components/ui/primitives";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/70 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 text-sm text-muted md:flex">
            {[
              ["Meet Mate", "#mate"],
              ["How it works", "#how-it-works"],
              ["FAQ", "#faq"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3 py-1.5 transition-colors hover:bg-surface-2 hover:text-fg"
              >
                {label}
              </a>
            ))}
            <Link
              href="/library"
              className="rounded-lg px-3 py-1.5 transition-colors hover:bg-surface-2 hover:text-fg"
            >
              Playbook library
            </Link>
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <ButtonLink href="#waitlist" size="sm" className="shadow-md shadow-accent/20">
              Get early access
            </ButtonLink>
          </div>
        </Container>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border bg-surface">
        <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted">
              An AI SDR for teams that need pipeline, not another dashboard.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <a href="#mate" className="transition-colors hover:text-fg">
              Meet Mate
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-fg">
              How it works
            </a>
            <a href="#faq" className="transition-colors hover:text-fg">
              FAQ
            </a>
            <Link href="/library" className="transition-colors hover:text-fg">
              Playbook library
            </Link>
            <Link href="/standards" className="transition-colors hover:text-fg">
              Standards
            </Link>
          </nav>
        </Container>

        <Container className="border-t border-border py-5">
          <p className="text-xs text-faint">
            &copy; {new Date().getFullYear()} aLeadMate. Early access &mdash; features
            described here are what we are building, not what is shipped.
          </p>
        </Container>
      </footer>
    </>
  );
}
