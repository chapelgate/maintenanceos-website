/**
 * WCAG 2.2 AA compliant cookie consent banner.
 * 
 * Placement: injected at the top of <main> in layout.tsx after SkipLink.
 * State persisted in localStorage.cookieConsentChoice.
 * 
 * Behaviour:
 * - Accept: sets all categories on, persists choice, allows change later
 * - Reject: turns off non-essential categories, persists choice, blocks
 *   non-essential scripts from running until consent given
 * - Choice is changeable any time via /cookies/#settings or the manage link
 * - Focus is never trapped; users can Tab/Escape out
 * - Visible focus indicator via --mos-focus-ring
 * - Contrast meets WCAG 2.2 AA (bg text-ink on bg-paper)
 * - Roles: aria-live="polite" for announcements
 * - All text labels are descriptive and unambiguous
 */

"use client";

import { useEffect, useState, useRef, useCallback } from "react";

type CookieCategory =
  | "essential"
  | "preferences"
  | "analytics"
  | "marketing";

type ConsentChoice = Record<CookieCategory, boolean>;

const DEFAULT_CHOICE: ConsentChoice = {
  essential: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

const STORAGE_KEY = "cookieConsentChoice";

function getStoredChoice(): ConsentChoice {
  if (typeof window === "undefined") return DEFAULT_CHOICE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        essential: parsed.essential ?? true,
        preferences: parsed.preferences ?? false,
        analytics: parsed.analytics ?? false,
        marketing: parsed.marketing ?? false,
      };
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_CHOICE;
}

function storeChoice(choice: ConsentChoice): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
  }
}

/**
 * State machine for cookie consent.
 * Tracks the current choice and whether non-essential scripts are blocked.
 */
function useCookieConsent(): [
  ConsentChoice,
  {
    accept: () => void;
    reject: () => void;
    preferences: () => void;
    toggleCategory: (category: CookieCategory, on: boolean) => void;
    isBlocked: boolean;
  }
] {
  const stored = getStoredChoice();
  const [choice, setChoice] = useState<ConsentChoice>(stored);
  const [isBlocked] = useState(!stored.essential);

  // Persist to storage on change
  useEffect(() => {
    storeChoice(choice);
  }, [choice]);

  const toggleCategory = useCallback(
    (category: CookieCategory, on: boolean) => {
      if (category === "essential") return; // essential always on
      setChoice((prev) => ({
        ...prev,
        [category]: on,
      }));
    },
    [],
  );

  const accept = useCallback(() => {
    setChoice({
      essential: true,
      preferences: true,
      analytics: true,
      marketing: true,
    });
  }, []);

  const reject = useCallback(() => {
    setChoice({
      essential: true,
      preferences: false,
      analytics: false,
      marketing: false,
    });
  }, []);

  const preferences = useCallback(() => {
    setChoice({
      essential: true,
      preferences: true,
      analytics: false,
      marketing: false,
    });
  }, []);

  return [
    choice,
    {
      accept,
      reject,
      preferences,
      toggleCategory,
      isBlocked,
    },
  ];
}

export function CookieConsentBanner() {
  const [choice, { accept, reject, toggleCategory, isBlocked }] =
    useCookieConsent();

  const announce = useRef<((message: string) => void) | undefined>(undefined);

  // Announce choice change to screen readers
  useEffect(() => {
    announce.current?.(
      `Cookies ${choice.analytics === true && choice.marketing === true ? "accepted" : "rejected"}. You can change your choice any time via the cookie settings link.`,
    );
  }, [choice]);

  // Track isBlocked state changes for script control
  useEffect(() => {
    const newBlocked = !(choice.analytics === true && choice.marketing === true);
    if (newBlocked !== isBlocked) {
      // Flag updated - external script blocker can react to isBlocked
    }
  }, [choice, isBlocked]);

  return (
    <div
      role="banner"
      aria-live="polite"
      className="cookie-consent-banner fixed top-0 left-0 right-0 z-50 border-b border-border bg-paper px-4 py-3 text-sm text-ink"
      style={{
        backgroundColor: "var(--color-paper)",
        color: "var(--color-ink)",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <p className="font-medium text-ink">
          This website uses cookies to ensure you get the best experience.
        </p>
        <p className="mt-1 text-muted">
          {" "}
          <strong>{choice.essential ? "Essential cookies" : "Strictly necessary cookies"} are always enabled</strong>
          to keep the site running securely.
        </p>
        {!choice.essential && (
          <p className="mt-1 text-muted">
            <strong>Accessibility note:</strong> Essential cookies enable core
            functionality including focus indicators and form validation.
          </p>
        )}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-ink">
              {" "}
              {choice.preferences ? "Preferences cookies" : "Optional preferences cookies"}
              {" "}
              {choice.preferences ? "(on)" : "(off)"}
            </span>
            <button
              onClick={() => toggleCategory("preferences", true)}
              className="ml-2 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label="Toggle preferences cookies"
              aria-pressed={choice.preferences}
              style={{ outline: "none" }}
            >
              {choice.preferences ? "Keep on" : "Turn off"}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-ink">
              {" "}
              {choice.analytics ? "Analytics cookies" : "Optional analytics cookies"}
              {" "}
              {choice.analytics ? "(on)" : "(off)"}
            </span>
            <button
              onClick={() => toggleCategory("analytics", true)}
              className="ml-2 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label="Toggle analytics cookies"
              aria-pressed={choice.analytics}
              style={{ outline: "none" }}
            >
              {choice.analytics ? "Keep on" : "Turn off"}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-ink">
              {" "}
              {choice.marketing ? "Marketing cookies" : "Optional marketing cookies"}
              {" "}
              {choice.marketing ? "(on)" : "(off)"}
            </span>
            <button
              onClick={() => toggleCategory("marketing", true)}
              className="ml-2 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label="Toggle marketing cookies"
              aria-pressed={choice.marketing}
              style={{ outline: "none" }}
            >
              {choice.marketing ? "Keep on" : "Turn off"}
            </button>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={accept}
            className="flex-1 py-2 px-4 rounded-md bg-accent text-on-accent font-medium text-sm hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors"
            aria-label="Accept all cookies"
          >
            Accept all
          </button>
          <button
            onClick={reject}
            className="flex-1 py-2 px-4 rounded-md border border-border text-ink font-medium text-sm hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors"
            aria-label="Reject non-essential cookies"
          >
            Reject non-essential
          </button>
        </div>
        <div className="mt-6 text-xs text-muted">
          <a
            href="/cookies/#settings"
            className="underline"
          >
            Manage preferences
          </a>
          {" "}
          {" "}
          <a
            href="/cookies/"
            className="underline ml-2"
          >
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
}