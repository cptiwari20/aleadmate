import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadMate",
  description: "Simple lead management, right in your browser.",
  openGraph: {
    title: "LeadMate",
    description: "Track leads. Remember follow-ups. Close more.",
    images: ["/assets/leadmate-full.png"],
  },
  icons: {
    icon: "/assets/leadmate-mark-green.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
