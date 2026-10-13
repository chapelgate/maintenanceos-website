import React from "react";

export function EmergencyBanner({
  id = "gas",
  className = "",
}: {
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby="emergency-heading"
      className={`mos-emergency-banner rounded-[var(--mos-radius-lg)] border-2 border-red-500/40 bg-red-500/10 p-5 text-ink ${className}`.trim()}
    >
      <div className="flex items-start gap-3">
        <svg
          className="h-6 w-6 text-red-500 mt-0.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div>
          <h2 id="emergency-heading" className="font-semibold text-base sm:text-lg text-ink">
            If you smell gas right now or suspect carbon monoxide
          </h2>
          <p className="mt-1 text-sm text-muted">
            Get into fresh air immediately. Do not touch electrical switches, turn appliances on or off, or ignite flames.
          </p>
          <div className="mt-3 text-sm text-muted space-y-1">
            <p>
              <strong>Carbon monoxide: know the signs.</strong> Headaches, nausea, dizziness, breathlessness, collapse, and loss of consciousness.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <a
              href="tel:0800111999"
              className="inline-flex min-h-11 items-center justify-center rounded bg-red-600 px-3.5 py-2 text-white hover:bg-red-700"
            >
              Gas Emergency (GB): 0800 111 999
            </a>
            <a
              href="tel:0800002001"
              className="inline-flex min-h-11 items-center justify-center rounded border border-border bg-surface px-3.5 py-2 text-ink hover:border-accent"
            >
              Gas Emergency (NI): 0800 002 001
            </a>
            <a
              href="tel:999"
              className="inline-flex min-h-11 items-center justify-center rounded border border-border bg-surface px-3.5 py-2 text-ink hover:border-accent"
            >
              Danger to life: Call 999
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
