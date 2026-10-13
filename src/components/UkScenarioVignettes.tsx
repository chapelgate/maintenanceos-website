/**
 * Labelled UK maintenance scenarios — not testimonials, not live-call samples.
 * Playbook cards (Smith/Rosie analogue) stay claims-safe product design.
 */
const SCENARIOS = [
  {
    label: "Scenario: leaky tap",
    body: "Structured intake without invented visits.",
  },
  {
    label: "Scenario: no heat",
    body: "Collect details; never invent bookings or arrival promises.",
  },
  {
    label: "Scenario: access",
    body: "Capture tenant availability accurately.",
  },
  {
    label: "Scenario: contractor chase",
    body: "Structured job notes without invented dispatches.",
  },
  {
    label: "Scenario: 999 latch",
    body: "UK 999 guidance (never 911). Critical safety latches for a person.",
  },
] as const;

export function UkScenarioVignettes() {
  return (
    <section
      id="scenarios"
      aria-labelledby="uk-scenarios-heading"
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
    >
      <h2
        id="uk-scenarios-heading"
        className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
      >
        UK maintenance playbooks
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((item) => (
          <li key={item.label}>
            <article className="h-full rounded-[var(--mos-radius-lg)] border border-border bg-surface p-3.5 shadow-[var(--mos-shadow)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {item.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink">{item.body}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
