import { FeatureStatusChip } from "@/components/FeatureStatusChip";
import { IntakeOrbAccent } from "@/components/IntakeOrbAccent";
import { CREATE_JOURNEY_STEPS } from "@/lib/onboarding-create";

/**
 * Onboarding Section: Single clean horizontal pipeline bar
 * Website → Check → Choose → Configure → Review & Try
 */
const STEP_HINTS = [
  "Public URL & email",
  "Fact extraction",
  "Select bounded role",
  "Approved boundaries",
  "Browser voice preview",
] as const;

export function HomeOnboardingSteps() {
  return (
    <section
      id="path"
      aria-labelledby="home-onboarding-heading"
      className="border-b border-border bg-surface px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <IntakeOrbAccent />
            <div>
              <h2
                id="home-onboarding-heading"
                className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
              >
                How to start — five steps
              </h2>
              <p className="text-xs text-muted">
                {CREATE_JOURNEY_STEPS.map((step) => step.label).join(" → ")}
              </p>
            </div>
          </div>
          <FeatureStatusChip status="UNDER_TEST" />
        </div>

        <div className="mos-pipeline grid gap-3 sm:grid-cols-5">
          {CREATE_JOURNEY_STEPS.map((step, idx) => (
            <a
              key={step.label}
              href="/create/"
              className="flex flex-col rounded-lg border border-border bg-paper p-3.5 transition-colors hover:border-accent"
            >
              <span className="text-xs font-bold text-accent">STEP {idx + 1}</span>
              <span className="mt-1 font-semibold text-sm text-ink">{step.label}</span>
              <span className="mt-1 text-xs text-muted">{STEP_HINTS[idx]}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
