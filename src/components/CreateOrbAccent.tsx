/**
 * Decorative Siri-like glow for /create. CSS only — no client island.
 * Must not sit on the scan/form wiring.
 */
export function CreateOrbAccent() {
  return (
    <div className="create-orb-accent">
      <span className="siri-orb--mini" aria-hidden="true" />
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        Website → draft pack
      </p>
    </div>
  );
}
