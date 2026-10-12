/**
 * Logo-free trust strip under the home hero. Claims-safe scan line only.
 * Chips are honesty tokens — not customer logos, awards, or metrics.
 */
const TRUST_CHIPS = [
  "Pre-launch",
  "UK maintenance ops",
  "Rules own safety & money",
  "No live phone on this site",
] as const;

export function HomeTrustStrip() {
  return (
    <div className="home-trust-strip border-b border-border bg-paper px-4 py-3 sm:px-6">
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2">
        {TRUST_CHIPS.map((chip) => (
          <li key={chip}>
            <span className="home-trust-chip">{chip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
