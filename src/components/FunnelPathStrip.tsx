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
        Website → Check → Choose → Review → Pack → optional sandbox → early access.{" "}
        <a
          href="/create/"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          Create from website
        </a>{" "}
        is the primary start. This site does not assign a live phone number.
      </p>
    </aside>
  );
}
