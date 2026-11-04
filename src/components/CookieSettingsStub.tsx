"use client";

import { useState } from "react";

type ConsentChoice = "accept" | "reject";
const STORAGE_KEY = "cookieConsentChoice";

function readChoice(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value);
    return parsed.analytics && parsed.marketing ? "accept" : "reject";
  } catch {
    return null;
  }
}

function saveChoice(choice: ConsentChoice): void {
  const optional = choice === "accept";
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, preferences: optional, analytics: optional, marketing: optional }));
  } catch {}
}

export function CookieSettingsStub() {
  const [choice, setChoice] = useState<ConsentChoice | null>(readChoice);
  function choose(nextChoice: ConsentChoice) {
    saveChoice(nextChoice);
    setChoice(nextChoice);
  }

  return (
    <div className="mt-4 rounded-md border border-border bg-paper px-4 py-4 text-sm text-muted">
      <p className="font-medium text-ink" aria-live="polite">Current choice: {choice === "accept" ? "optional categories accepted" : choice === "reject" ? "optional categories rejected" : "not set"}.</p>
      <p className="mt-2">This setting records only your choice in local storage. The pre-launch site currently has no analytics or marketing cookies or tags to enable. Cookieless first-party operational measurement does not use this choice and stores no persistent visitor identifier.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => choose("accept")} className="min-h-11 rounded-md border border-accent bg-accent px-4 py-2 font-medium text-on-accent hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">Accept optional categories</button>
        <button type="button" onClick={() => choose("reject")} className="min-h-11 rounded-md border border-border bg-paper px-4 py-2 font-medium text-ink hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">Reject optional categories</button>
      </div>
      <p className="mt-3 text-xs">Draft behavior pending legal confirmation. This is not a PECR, GDPR, or accessibility conformance certification.</p>
    </div>
  );
}
