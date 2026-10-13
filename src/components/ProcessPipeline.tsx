import React from "react";

type PipelineStep = {
  step: string;
  title: string;
  description: string;
};

const DEFAULT_STEPS: PipelineStep[] = [
  { step: "STEP 1", title: "Website", description: "Public URL extraction" },
  { step: "STEP 2", title: "Check", description: "Validate business facts" },
  { step: "STEP 3", title: "Choose", description: "Select bounded role" },
  { step: "STEP 4", title: "Configure", description: "Set approved boundaries" },
  { step: "STEP 5", title: "Review & Try", description: "Browser voice preview" },
];

export function ProcessPipeline({
  steps = DEFAULT_STEPS,
  className = "",
}: {
  steps?: PipelineStep[];
  className?: string;
}) {
  return (
    <div className={`mos-pipeline grid gap-3 sm:grid-cols-5 ${className}`.trim()}>
      {steps.map((s, idx) => (
        <div
          key={s.step}
          className="flex flex-col rounded-lg border border-border bg-surface p-3.5 transition-colors hover:border-accent/40"
        >
          <span className="text-xs font-bold text-accent">{s.step}</span>
          <span className="mt-1 font-semibold text-sm text-ink">{s.title}</span>
          <span className="mt-1 text-xs text-muted">{s.description}</span>
        </div>
      ))}
    </div>
  );
}
