/**
 * How-it-works flow — matches /create stepper:
 * Website → Check → Choose → Configure → Review & Try.
 * Unified mos-glass ladder: number → title → status. CSS only; AA arrows/paper.
 */
import { FeatureStatusChip } from "@/components/FeatureStatusChip";
import { CREATE_JOURNEY_STEPS } from "@/lib/onboarding-create";
import type { MarketingCardStatus } from "@/config/phone-ai-features";

const STAGE_COPY = [
  {
    id: "website",
    short: "Public business URL",
    body: "Enter website URL and email for preview.",
    note: "Read-only crawl follows robots.txt. No live number.",
    status: "UNDER_TEST",
  },
  {
    id: "check",
    short: "Validate URL",
    body: "Read public pages for reviewable facts.",
    note: "Website learning is read-only and bounded, and it follows robots.txt. Extracted facts are reviewable. Missing hours, services, or FAQs stay empty when not found.",
    status: "UNDER_TEST",
  },
  {
    id: "choose",
    short: "Choose bounded role",
    body: "Select a role such as maintenance desk.",
    note: "Creates draft AgentBlueprint; credentials untouched.",
    status: "UNDER_TEST",
  },
  {
    id: "configure",
    short: "Configure actions",
    body: "Set voice and human-transfer rules.",
    note: "Narrow permissions only; cannot alter routing.",
    status: "UNDER_TEST",
  },
  {
    id: "review_pack",
    short: "Review and test",
    body: "Confirm facts and test via browser voice.",
    note: "The browser voice receptionist is available after review. Tests audio locally; not a live public telephone call.",
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
    <span className="hiw-step-number flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent bg-paper text-xs font-semibold text-accent">
      {index + 1}
    </span>
  );
}

function StageLadderArrow() {
  return (
    <span
      className="pointer-events-none flex items-center justify-center py-1.5 text-accent"
      aria-hidden="true"
    >
      <svg width="12" height="16" viewBox="0 0 12 20" fill="none">
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
            <h3 className="text-base font-semibold tracking-tight text-ink">
              {stage.title}
            </h3>
            <FeatureStatusChip status={stage.status} />
          </div>
        </div>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        {stage.body}
      </p>
      <details className="mt-2 group rounded-lg border border-border bg-surface p-2 text-xs">
        <summary className="flex cursor-pointer items-center justify-between font-medium text-ink list-none">
          <span>Boundary</span>
          <span className="text-muted group-open:rotate-180 transition-transform">▾</span>
        </summary>
        <p className="mt-1 pt-1 border-t border-border text-muted leading-relaxed">
          {stage.note}
        </p>
      </details>
    </>
  );
}

export function HowItWorksFlow() {
  return (
    <section
      aria-labelledby="flow-heading"
      className="mx-auto max-w-3xl px-4 py-8 sm:py-12"
    >
      <h2
        id="flow-heading"
        className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
      >
        Website → Check → Choose → Configure → Review & Try
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Five steps from public URL to interactive browser preview.
      </p>

      <ol
        className="mt-6 space-y-2"
        aria-label="How MaintenanceOS onboarding is designed to work"
      >
        {STAGES.map((stage, i) => (
          <li key={stage.id} className="relative">
            <div className="mos-glass flex flex-col bg-paper p-4 sm:p-5">
              <StageBody stage={stage} showBadge index={i} />
            </div>
            {i < STAGES.length - 1 ? <StageLadderArrow /> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
