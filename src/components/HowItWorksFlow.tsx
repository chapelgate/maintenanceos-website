/**
 * How-it-works flow — COPY_PACK §B v3.2 diagram labels (unchanged).
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

type Stage = (typeof STAGES)[number];

function StageBadge({ index }: { index: number }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-on-accent">
      {index + 1}
    </span>
  );
}

function StageBody({
  stage,
  showBadge,
  index,
}: {
  stage: Stage;
  showBadge: boolean;
  index: number;
}) {
  return (
    <>
      {showBadge ? <StageBadge index={index} /> : null}
      <h3
        className={`text-lg font-semibold tracking-tight text-ink ${
          showBadge ? "mt-4" : ""
        }`}
      >
        {stage.title}
      </h3>
      <p className="mt-1 text-sm font-medium leading-snug text-accent">
        {stage.short}
      </p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        {stage.body}
      </p>
      {"note" in stage && stage.note ? (
        <p className="mt-4 border-l-2 border-accent pl-3 text-xs leading-relaxed text-muted">
          <span className="font-medium text-ink">Status: </span>
          {stage.note}
        </p>
      ) : null}
    </>
  );
}

export function HowItWorksFlow() {
  return (
    <section
      aria-labelledby="flow-heading"
      className="mx-auto max-w-5xl px-4 py-12 sm:py-16"
    >
      <h2
        id="flow-heading"
        className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
      >
        Three stages property teams can trust
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
        AI assists at intake and classification. Authority for safety and
        consequential actions stays with system rules and people.
      </p>

      <ol
        className="mt-10 hidden md:grid md:grid-cols-3 md:gap-6"
        aria-label="How MaintenanceOS is designed to work"
      >
        {STAGES.map((stage, i) => (
          <li key={stage.id} className="relative flex flex-col">
            <div
              className="flex flex-1 flex-col rounded-[length:var(--mos-radius-lg)] border border-border bg-surface p-6"
              style={{ boxShadow: "var(--mos-shadow)" }}
            >
              <StageBody stage={stage} showBadge index={i} />
            </div>
            {i < STAGES.length - 1 ? (
              <span
                className="pointer-events-none absolute top-[2.75rem] -right-4 z-10 flex w-8 items-center justify-center text-accent"
                aria-hidden="true"
              >
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                  <path
                    d="M1 6h16M13 1.5 18.5 6 13 10.5"
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
        className="relative mt-10 md:hidden"
        aria-label="How MaintenanceOS is designed to work"
      >
        {STAGES.map((stage, i) => (
          <li key={stage.id} className="relative flex gap-4 pb-8 last:pb-0">
            <div className="flex w-9 flex-col items-center">
              <StageBadge index={i} />
              {i < STAGES.length - 1 ? (
                <span
                  className="mt-2 w-0.5 flex-1 min-h-8 bg-accent/30"
                  aria-hidden="true"
                />
              ) : null}
            </div>
            <div
              className="flex-1 rounded-[length:var(--mos-radius-lg)] border border-border bg-surface p-4"
              style={{ boxShadow: "var(--mos-shadow)" }}
            >
              <StageBody stage={stage} showBadge={false} index={i} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
