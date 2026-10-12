import { CREATE_JOURNEY_STEPS } from "@/lib/onboarding-create";

/**
 * Shared “one public path” strip — keeps /create, /demo, /pricing, /contact
 * pointing at the same claims-safe journey. Not a live phone.
 */
const PUBLIC_STEPS = CREATE_JOURNEY_STEPS.map((step) => step.label).join(" → ");

export function FunnelPathStrip({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`mos-glass px-4 py-3 text-sm leading-relaxed text-muted ${className}`.trim()}
    >
      <p>
        <span className="font-semibold text-ink">One public path. </span>
        {PUBLIC_STEPS}.{" "}
        <a
          href="/demo/"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          Request an early demo
        </a>
        , or{" "}
        <a
          href="/create/"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          try the website setup preview
        </a>
        . This site does not assign a live phone number.
      </p>
    </aside>
  );
}
