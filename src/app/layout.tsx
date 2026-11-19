import type { Metadata } from "next";
import type { ReactNode } from "react";
import { themeScript } from "@/components/theme-toggle";
import { marketing, site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${marketing.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: marketing.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
  },
};

/**
 * Chrome lives in the route-group layouts, not here: the waitlist landing page
 * and the playbook library are two different front doors and should not share
 * a header.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
