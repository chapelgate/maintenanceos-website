/**
 * Shared “one public path” strip — keeps /create, /demo, /pricing, /contact
 * pointing at the same claims-safe journey. Not a live phone.
 */
export function FunnelPathStrip({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`mos-glass px-4 py-3 text-sm leading-relaxed text-muted ${className}`.trim()}
    >
      <p>
        <span className="font-semibold text-ink">One public path. </span>
        Website → Check → Choose → Configure → Review & Try → optional save.{" "}
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
