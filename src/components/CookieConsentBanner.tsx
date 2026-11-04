"use client";

import { useCallback, useState } from "react";

type CookieCategory = "essential" | "preferences" | "analytics" | "marketing";
type ConsentChoice = Record<CookieCategory, boolean>;

const STORAGE_KEY = "cookieConsentChoice";
const ACCEPTED_CHOICE: ConsentChoice = { essential: true, preferences: true, analytics: true, marketing: true };
const REJECTED_CHOICE: ConsentChoice = { essential: true, preferences: false, analytics: false, marketing: false };

function hasStoredChoice(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function storeChoice(choice: ConsentChoice): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
  } catch {}
}

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(() => !hasStoredChoice());
  const choose = useCallback((choice: ConsentChoice) => {
    storeChoice(choice);
    setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  return (
    <section aria-labelledby="cookie-consent-title" className="cookie-consent-banner fixed inset-x-0 bottom-0 z-50 border-t border-border bg-paper px-4 py-4 text-sm text-ink shadow-lg">
      <div className="mx-auto max-w-3xl">
        <h2 id="cookie-consent-title" className="font-semibold text-ink">Cookie preferences</h2>
        <p className="mt-1 text-muted">
          This pre-launch site currently uses cookieless operational measurement and no analytics or marketing cookies. We store only your choice in this browser so the notice stays dismissed. Optional categories remain off unless you accept them.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => choose(ACCEPTED_CHOICE)} className="min-h-11 flex-1 rounded-md border border-accent bg-accent px-4 py-2 font-medium text-on-accent hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">Accept optional categories</button>
          <button type="button" onClick={() => choose(REJECTED_CHOICE)} className="min-h-11 flex-1 rounded-md border border-border bg-paper px-4 py-2 font-medium text-ink hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">Reject optional categories</button>
        </div>
        <p className="mt-3 text-xs text-muted"><a href="/cookies/#settings" className="rounded-sm font-medium text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">Cookie settings and draft notice</a></p>
      </div>
    </section>
  );
}
