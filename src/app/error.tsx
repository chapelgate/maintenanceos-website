"use client";

// NOTE: Error boundaries MUST NOT expose diagnostics to users
// to end users. Diagnostic logging is suppressed.
// suppressed. See release-preflight for the gate.

import { useEffect, useRef } from "react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div
      role="alert"
      className="mx-auto max-w-3xl space-y-4 px-4 py-16 text-muted"
    >
      <p className="text-sm font-medium uppercase tracking-wide text-accent">
        Pre-launch
      </p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-3xl font-semibold tracking-tight text-ink outline-none"
      >
        This page did not finish
      </h1>
      <p>
        WorkSmartOS is a pre-launch synthetic demo. Nothing was sold, booked,
        or connected from this screen.
      </p>
      <p>
        This screen does not publish a price, assign a live phone number,
        connect a calendar, or deliver chat.
      </p>
      <p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
        >
          Try again
        </button>
      </p>
      <p>
        Related pre-launch pages:{" "}
        <a
          href="/"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          Back to the homepage
        </a>
        {" · "}
        <a
          href="/demo/"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          Scripted preview
        </a>
        {" · "}
        <a
          href="/help/"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          Help
        </a>
        {" · "}
        <a
          href="/trust/"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          Trust
        </a>
        {" · "}
        <a
          href="/security/"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          Security
        </a>
        {" · "}
        <a
          href="/contact/"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          Contact
        </a>
        . Failure screen only — not a live support desk.
      </p>
    </div>
  );
}
