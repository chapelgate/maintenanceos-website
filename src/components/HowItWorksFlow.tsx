/**
 * How-it-works flow — matches /create stepper (PR #47):
 * Website → Check → Review → Pack.
 * CSS only; mobile vertical stepper; no AI-theatre animation.
 */
import { CREATE_JOURNEY_STEPS } from "@/lib/onboarding-create";

const STAGE_COPY = [
  {
    id: "website",
    short: "Start with a public business URL",
    body: "Paste a public site URL and an email so we can record the early access request. Checking the website does not assign a live phone number.",
    note: "The public /create funnel exists today — early access only, not a live receptionist.",
  },
  {
    id: "check",
    short: "Scan if configured — otherwise queue the crawl",
    body: "If a scan service is configured we ask the SSRF-safe companion for a draft. If not, the crawl is queued. We do not invent extracted hours, services, or FAQs.",
    note: "SSRF-safe website scan is under testing — not a live knowledge crawl. Staging often queues the crawl honestly.",
  },
  {
    id: "review",
    short: "Edit the draft before anything is stored",
    body: "You review business name, greeting, hours, services, and FAQs. Copied fields show where they came from and how confident the scan was. Empty fields were not invented.",
  },
  {
    id: "pack",
    short: "Preview a claims-safe knowledge pack",
    body: "The reviewed draft becomes a knowledge pack and system prompt you can edit. Missing hours or services stay missing. Then you submit early access — no live number is assigned.",
    note: "Optional scripted sandbox demo is under testing and off by default. It is not a live customer call.",
  },
] as const;

const STAGES = CREATE_JOURNEY_STEPS.map((step, i) => {
  const copy = STAGE_COPY[i];
  if (!copy) {
    throw new Error(`Missing how-it-works copy for ${step.label}`);
  }
  return { ...copy, title: step.label };
});

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
        Website → Check → Review → Pack
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
        The same steps as{" "}
        <a
          href="/create/"
          className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          Create from website
        </a>
        . Typical shape: website URL → scan/draft → knowledge pack → optional
        scripted sandbox → early access. We do not invent crawl results or a
        live phone number.
      </p>

      <ol
        className="mt-10 hidden md:grid md:grid-cols-2 md:gap-6"
        aria-label="How MaintenanceOS onboarding is designed to work"
      >
        {STAGES.map((stage, i) => (
          <li key={stage.id} className="relative flex flex-col">
            <div
              className="flex flex-1 flex-col rounded-[length:var(--mos-radius-lg)] border border-border bg-surface p-6"
              style={{ boxShadow: "var(--mos-shadow)" }}
            >
              <StageBody stage={stage} showBadge index={i} />
            </div>
            {i % 2 === 0 ? (
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
        aria-label="How MaintenanceOS onboarding is designed to work"
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
