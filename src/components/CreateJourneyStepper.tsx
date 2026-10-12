import type { Ref } from "react";
import {
  CREATE_JOURNEY_STEPS,
  createJourneyStepAnnouncement,
  createJourneyStepStatus,
  createJourneyStepStatusLabel,
  type CreateJourneyStep,
} from "@/lib/onboarding-create-core";

/**
 * Shared /create stepper. Website → Check → Choose → Configure → Review & Try.
 * Lives in the first-load island on step 1 and again in the deferred
 * later-steps chunk — keep this file free of scan/lead imports.
 */
export function CreateJourneyStepper({
  step,
  headingRef,
}: {
  step: CreateJourneyStep;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="create-step-chrome">
      <div className="create-step-chrome-bar">
        <ol
          className="grid grid-cols-5 gap-2 text-center text-xs font-medium"
          aria-label="Create AI agent steps"
        >
          {CREATE_JOURNEY_STEPS.map((item) => {
            const statusForStep = createJourneyStepStatus(item.step, step);
            const current = statusForStep === "current";
            const done = statusForStep === "completed";
            return (
              <li
                key={item.step}
                aria-current={current ? "step" : undefined}
                className={
                  current
                    ? "rounded-md bg-accent-subtle px-2 py-2 text-ink"
                    : done
                      ? "rounded-md px-2 py-2 text-ink"
                      : "rounded-md px-2 py-2 text-muted"
                }
              >
                <span className="sr-only">
                  {createJourneyStepStatusLabel(statusForStep)}.{" "}
                </span>
                <span className="block text-[0.7rem] uppercase tracking-wide">
                  Step {item.step}
                </span>
                {item.label}
              </li>
            );
          })}
        </ol>
      </div>
      <h3 ref={headingRef} tabIndex={-1} className="sr-only">
        {createJourneyStepAnnouncement(step)}
      </h3>
    </div>
  );
}
