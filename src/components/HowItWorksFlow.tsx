/**
 * Visual intake → triage → oversight → execution flow.
 * CSS/SVG only — static export friendly, no client JS.
 */
const STAGES = [
  {
    id: "intake",
    title: "Intake",
    short: "Requests arrive",
    body: "Residents, agents, or voice channels. Caller and property details become structured work.",
  },
  {
    id: "triage",
    title: "Triage & rules",
    short: "Classify & route",
    body: "Deterministic safety and lifecycle rules classify and route. AI may draft or classify — it does not override safety rules.",
  },
  {
    id: "oversight",
    title: "Human oversight",
    short: "Clearance first",
    body: "Critical safety paths need human clearance. Escalation queues keep people in the loop before consequential dispatch.",
  },
  {
    id: "execution",
    title: "Accountable execution",
    short: "Jobs & audit",
    body: "Jobs, communications, and audit evidence stay tied to the work order so operations stay reviewable.",
  },
] as const;

export function HowItWorksFlow() {
  return (
    <section aria-labelledby="flow-heading" className="mx-auto max-w-5xl px-4 py-12">
      <h2 id="flow-heading" className="text-2xl font-semibold text-ink">
        The operations flow
      </h2>
      <p className="mt-2 max-w-2xl text-muted">
        Designed so intake and assistance sit in front of deterministic controls —
        not the other way around.
      </p>

      <ol
        className="mt-10 hidden md:grid md:grid-cols-4 md:gap-3"
        aria-label="How MaintenanceOS is designed to work"
      >
        {STAGES.map((stage, i) => (
          <li key={stage.id} className="relative flex flex-col">
            <div className="flex flex-1 flex-col rounded-lg border border-border bg-surface p-5 shadow-[0_1px_2px_rgb(15_23_42_/_6%),0_8px_24px_rgb(15_23_42_/_6%)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{stage.title}</h3>
              <p className="mt-1 text-sm font-medium text-accent">{stage.short}</p>
              <p className="mt-3 flex-1 text-sm text-muted">{stage.body}</p>
            </div>
            {i < STAGES.length - 1 ? (
              <span
                className="pointer-events-none absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-accent md:block"
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      <ol className="mt-8 space-y-4 md:hidden" aria-label="How MaintenanceOS is designed to work">
        {STAGES.map((stage, i) => (
          <li
            key={stage.id}
            className="flex gap-4 rounded-lg border border-border bg-surface p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
              {i + 1}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-ink">{stage.title}</h3>
              <p className="mt-1 text-sm font-medium text-accent">{stage.short}</p>
              <p className="mt-2 text-sm text-muted">{stage.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
