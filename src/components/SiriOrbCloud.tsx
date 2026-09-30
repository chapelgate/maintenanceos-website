"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Secondary “intake listening” affordance — not the brand mark, not a CTA.
 * CSS expand/collapse. Tiny client island for toggle, Escape, and focus restore.
 */
export function SiriOrbCloud() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const firstLink = panelRef.current?.querySelector("a");
    firstLink?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="intake-orb-wrap">
      <div className={`intake-orb-stage${open ? " is-open" : ""}`}>
        <button
          ref={buttonRef}
          type="button"
          className="intake-orb"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={
            open
              ? "Close intake listening note"
              : "Open intake listening note"
          }
          onClick={() => setOpen((value) => !value)}
        />
        <div
          ref={panelRef}
          id={panelId}
          className="intake-cloud mos-glass"
          role="region"
          aria-label="Intake listening"
          aria-hidden={!open}
          inert={!open ? true : undefined}
        >
          <div className="intake-cloud-inner">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              Intake listening
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              A listening cue for structured intake — preview only. Not a live
              receptionist, not always-on, and not a conversion control.
            </p>
            <p className="mt-3 text-sm">
              <a
                href="/how-it-works/"
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                See how it works
              </a>
              <span className="text-muted"> · </span>
              <a
                href="/create/"
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                Create from website
              </a>
            </p>
          </div>
        </div>
      </div>
      <p className="intake-orb-caption">Intake listening · preview</p>
    </div>
  );
}
