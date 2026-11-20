"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { SiteRead } from "@/lib/analyze/site";

type WebsiteState = {
  site: SiteRead | null;
  setSite: (site: SiteRead | null) => void;
};

const WebsiteContext = createContext<WebsiteState | null>(null);

/**
 * Carries the website from the hero down to the waitlist form, which sit in
 * different sections of a server-rendered page.
 */
export function WebsiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteRead | null>(null);
  const value = useMemo(() => ({ site, setSite }), [site]);
  return <WebsiteContext.Provider value={value}>{children}</WebsiteContext.Provider>;
}

export function useWebsite(): WebsiteState {
  return useContext(WebsiteContext) ?? { site: null, setSite: () => {} };
}
