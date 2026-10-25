"use client";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;

  return (
    <html lang="en-GB">
      <body>
        <main className="mx-auto max-w-3xl space-y-4 px-4 py-16 text-muted">
          <p className="text-sm font-medium uppercase tracking-wide text-accent">
            Pre-launch
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            This page did not finish
          </h1>
          <p>
            WorkSmartOS is a pre-launch synthetic demo. Nothing was sold,
            booked, or connected from this screen.
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
        </main>
      </body>
    </html>
  );
}
