"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CtaPair } from "@/components/CtaPair";

type SiriOrbCloudProps = {
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  subtitle?: string;
};

/**
 * Siri-inspired orb → frosted cloud. Tiny client island for toggle/Escape only.
 * Not a live phone control. Closed state stays a real button (aria-expanded).
 */
export function SiriOrbCloud({
  primaryHref = "/create/",
  primaryLabel = "Create from website",
  secondaryHref = "/demo/#demo",
  secondaryLabel = "Request early access",
  subtitle = "Pilot-stage. Website URL to a draft pack — not a live phone.",
}: SiriOrbCloudProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={`siri-orb-wrap${open ? " is-open" : ""}`}>
      <div className={`siri-orb-stage${open ? " is-open" : ""}`}>
        <button
          ref={buttonRef}
          type="button"
          className="siri-orb"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">
            {open ? "Close early access panel" : "Open early access panel"}
          </span>
        </button>
        <div
          id={panelId}
          className="siri-cloud mos-glass-dusk"
          role="region"
          aria-label="Early access"
          aria-hidden={!open}
          inert={!open ? true : undefined}
        >
          <p className="siri-cloud-kicker">Early access</p>
          <p className="siri-cloud-copy">{subtitle}</p>
          <CtaPair
            tone="on-dusk"
            primaryHref={primaryHref}
            primaryLabel={primaryLabel}
            secondaryHref={secondaryHref}
            secondaryLabel={secondaryLabel}
          />
          <p className="siri-cloud-hint">
            Escape or the glow closes this panel. No live phone from this
            control.
          </p>
        </div>
      </div>
      <p className="siri-orb-hint" aria-hidden={open}>
        Press the glow to begin
      </p>
    </div>
  );
}
