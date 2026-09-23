/**
 * How-it-works flow — matches /create stepper:
 * Website → Check → Review → Pack.
 * Unified mos-glass ladder: number → title → status. CSS only; AA arrows/paper.
 */
import { FeatureStatusChip } from "@/components/FeatureStatusChip";
import { CREATE_JOURNEY_STEPS } from "@/lib/onboarding-create";
import type { MarketingCardStatus } from "@/config/phone-ai-features";

const STAGE_COPY = [
  {
    id: "website",
    short: "Start with a public business URL",
    body: "Paste a public site URL and an email so we can record the early access request. Checking the website does not assign a live phone number.",
    note: "The public /create funnel exists today — early access only, not a live receptionist.",
    status: "UNDER_TEST",
  },
  {
    id: "check",
    short: "Scan if configured — otherwise queue the crawl",
    body: "If a scan service is configured we ask the SSRF-safe companion for a draft. If not, the crawl is queued. We do not invent extracted hours, services, or FAQs.",
    note: "SSRF-safe website scan is under testing — not a live knowledge crawl. Staging often queues the crawl honestly.",
    status: "UNDER_TEST",
  },
  {
    id: "review",
    short: "Edit the draft before anything is stored",
    body: "You review business name, greeting, hours, services, and FAQs. Copied fields show where they came from and how confident the scan was. Empty fields were not invented.",
    note: "Empty extract fields stay empty — we do not invent crawl results.",
    status: "UNDER_TEST",
  },
  {
    id: "pack",
    short: "Preview a claims-safe knowledge pack",
    body: "The reviewed draft becomes a knowledge pack and system prompt you can edit. Missing hours or services stay missing. Then you submit early access — no live number is assigned.",
    note: "Optional scripted sandbox demo is under testing and off by default. It is not a live customer call.",
    status: "UNDER_TEST",
  },
] as const satisfies readonly {
  id: string;
  short: string;
  body: string;
  note: string;
  status: MarketingCardStatus;
}[];

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
    <span className="hiw-step-number flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent bg-paper text-sm font-semibold text-accent">
      {index + 1}
    </span>
  );
}

function StageLadderArrow() {
  return (
    <span
      className="pointer-events-none flex items-center justify-center py-2 text-accent"
      aria-hidden="true"
    >
      <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
        <path
          d="M6 1v16M1.5 13 6 18.5 10.5 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
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
      <div className="flex flex-wrap items-start gap-3">
        {showBadge ? <StageBadge index={index} /> : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-ink">
              {stage.title}
            </h3>
            <FeatureStatusChip status={stage.status} />
          </div>
          <p className="mt-1 text-sm font-medium leading-snug text-accent">
            {stage.short}
          </p>
        </div>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        {stage.body}
      </p>
      <p className="mt-4 border-l-2 border-accent pl-3 text-xs leading-relaxed text-muted">
        <span className="font-medium text-ink">Status: </span>
        {stage.note}
      </p>
    </>
  );
}

export function HowItWorksFlow() {
  return (
    <section
      aria-labelledby="flow-heading"
      className="mx-auto max-w-3xl px-4 py-12 sm:py-16"
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
        className="mt-10"
        aria-label="How MaintenanceOS onboarding is designed to work"
      >
        {STAGES.map((stage, i) => (
          <li key={stage.id} className="relative">
            <div className="mos-glass flex flex-col bg-paper p-5 sm:p-6">
              <StageBody stage={stage} showBadge index={i} />
            </div>
            {i < STAGES.length - 1 ? <StageLadderArrow /> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
