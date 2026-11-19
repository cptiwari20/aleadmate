import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page itself is a client component and cannot export metadata.
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function SignInLayout({ children }: { children: ReactNode }) {
  return children;
}
