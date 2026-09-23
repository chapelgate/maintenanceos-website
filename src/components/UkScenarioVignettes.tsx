/**
 * Labelled UK maintenance scenarios — not testimonials, not live-call samples.
 */
const SCENARIOS = [
  {
    label: "Scenario: leaky tap",
    body: "A leaky tap stays structured intake — not an invented emergency visit or a dispatched van.",
  },
  {
    label: "Scenario: no heat",
    body: "Collect who, what, where, and access. Rules must not invent a booking, a slot, or “someone is on the way.”",
  },
  {
    label: "Scenario: 999 latch",
    body: "UK 999 guidance (never 911). Emergency services stay emergency services; critical safety is designed to latch for a person.",
  },
] as const;

export function UkScenarioVignettes() {
  return (
    <section
      aria-labelledby="uk-scenarios-heading"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6"
    >
      <h2
        id="uk-scenarios-heading"
        className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
      >
        UK maintenance scenarios
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Labelled scenarios from product design — not customer stories, not a live
        phone sample.
      </p>
      <ul className="mt-6 grid gap-3 md:grid-cols-3">
        {SCENARIOS.map((item) => (
          <li key={item.label}>
            <article className="h-full rounded-xl border border-border bg-paper p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {item.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink">{item.body}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
