import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink, Container } from "@/components/ui/primitives";
import { site } from "@/lib/site";
import { CHANNELS } from "@/lib/taxonomy";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
            <Link href="/library" className="transition-colors hover:text-fg">
              Library
            </Link>
            <Link href="/whats-working" className="transition-colors hover:text-fg">
              What&rsquo;s working
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ButtonLink href="/submit" variant="outline" size="sm" className="hidden sm:inline-flex">
            Publish a playbook
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <Container className="grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">{site.tagline}</p>
          <p className="mt-3 text-xs text-faint">
            Free to read, free to copy, no login wall. Permanently.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-faint">Channels</h3>
          <ul className="mt-3 grid gap-1.5">
            {CHANNELS.slice(0, 5).map((channel) => (
              <li key={channel.slug}>
                <Link
                  href={`/c/${channel.slug}`}
                  className="text-sm text-muted transition-colors hover:text-fg"
                >
                  {channel.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-faint">Project</h3>
          <ul className="mt-3 grid gap-1.5 text-sm text-muted">
            <li>
              <Link href="/library" className="transition-colors hover:text-fg">
                Browse the library
              </Link>
            </li>
            <li>
              <Link href="/submit" className="transition-colors hover:text-fg">
                Publish a playbook
              </Link>
            </li>
            <li>
              <Link href="/standards" className="transition-colors hover:text-fg">
                Quality standards
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
