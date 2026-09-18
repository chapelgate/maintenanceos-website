/**
 * How-it-works flow — COPY_PACK_HOME_HOW_DEMO.md §B diagram labels.
 * Intake → Controlled triage → Human oversight.
 * CSS only; mobile vertical stepper; no AI-theatre animation.
 */
const STAGES = [
  {
    id: "intake",
    title: "Intake",
    short: "Capture the call, don’t invent the job",
    body: "The receptionist layer is designed to collect caller details and classify what it hears in UK property-maintenance language — including 999 guidance where relevant.",
    note: "Voice intake is under testing for release — not offered here as a public always-on service.",
  },
  {
    id: "triage",
    title: "Controlled triage",
    short: "Deterministic rules decide what happens next",
    body: "Tenant isolation, lifecycle transitions, safety latching, escalation queues, and approvals sit in server rules. Consequential actions are not left to the model.",
  },
  {
    id: "oversight",
    title: "Human oversight",
    short: "Transfer and clearance when people need to decide",
    body: "Explicit-request human transfer and human clearance keep judgement with your team. No autonomous dispatch, booking, or payment claims.",
  },
] as const;

function StageCard({
  stage,
  index,
}: {
  stage: (typeof STAGES)[number];
  index: number;
}) {
  return (
    <div className="flex flex-1 flex-col rounded-lg border border-border bg-surface p-5 shadow-[0_1px_2px_rgb(15_23_42_/_6%),0_8px_24px_rgb(15_23_42_/_6%)]">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
        {index + 1}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-ink">{stage.title}</h3>
      <p className="mt-1 text-sm font-medium text-accent">{stage.short}</p>
      <p className="mt-3 flex-1 text-sm text-muted">{stage.body}</p>
      {"note" in stage && stage.note ? (
        <p className="mt-3 text-xs text-muted">
          <span className="font-medium text-ink">Status: </span>
          {stage.note}
        </p>
      ) : null}
    </div>
  );
}

export function HowItWorksFlow() {
  return (
    <section aria-labelledby="flow-heading" className="mx-auto max-w-5xl px-4 py-12">
      <h2 id="flow-heading" className="text-2xl font-semibold text-ink">
        Three stages property teams can trust
      </h2>
      <p className="mt-2 max-w-2xl text-muted">
        AI assists at intake and classification. Authority for safety and
        consequential actions stays with system rules and people.
      </p>

      <ol
        className="mt-10 hidden md:grid md:grid-cols-3 md:gap-4"
        aria-label="How MaintenanceOS is designed to work"
      >
        {STAGES.map((stage, i) => (
          <li key={stage.id} className="relative flex flex-col">
            <StageCard stage={stage} index={i} />
            {i < STAGES.length - 1 ? (
              <span
                className="pointer-events-none absolute -right-2.5 top-1/2 z-10 -translate-y-1/2 text-accent"
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

      <ol
        className="relative mt-8 space-y-0 md:hidden"
        aria-label="How MaintenanceOS is designed to work"
      >
        {STAGES.map((stage, i) => (
          <li key={stage.id} className="relative flex gap-4 pb-8 last:pb-0">
            <div className="flex flex-col items-center">
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                {i + 1}
              </span>
              {i < STAGES.length - 1 ? (
                <span
                  className="mt-1 min-h-[2rem] w-0.5 flex-1 bg-border"
                  aria-hidden="true"
                />
              ) : null}
            </div>
            <div className="flex-1">
              <StageCard stage={stage} index={i} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
