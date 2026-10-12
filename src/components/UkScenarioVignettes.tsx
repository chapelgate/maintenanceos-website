/**
 * Labelled UK maintenance scenarios — not testimonials, not live-call samples.
 * Playbook cards (Smith/Rosie analogue) stay claims-safe product design.
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
    label: "Scenario: access",
    body: "Who can let someone in, and when. Intake is designed to capture access — not to invent a contractor visit.",
  },
  {
    label: "Scenario: contractor chase",
    body: "Follow-up stays a structured job note. The model must not invent a dispatch, an ETA, or a promise that a van is coming.",
  },
  {
    label: "Scenario: 999 latch",
    body: "UK 999 guidance (never 911). Emergency services stay emergency services; critical safety is designed to latch for a person.",
  },
] as const;

export function UkScenarioVignettes() {
  return (
    <section
      id="scenarios"
      aria-labelledby="uk-scenarios-heading"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6"
    >
      <h2
        id="uk-scenarios-heading"
        className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
      >
        UK maintenance playbooks
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Labelled scenarios from product design — not customer stories, and not a
        sample of a real call. How intake is designed to treat common UK jobs.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((item) => (
          <li key={item.label}>
            <article className="h-full rounded-[var(--mos-radius-lg)] border border-border bg-surface p-4 shadow-[var(--mos-shadow)]">
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
