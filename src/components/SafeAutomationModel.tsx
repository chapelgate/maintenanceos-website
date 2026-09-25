import {
  aiMayAutomate,
  humanOrRuleGate,
  SAFE_AUTOMATION_TAGLINE,
  safeAutomationNever,
  safeAutomationStages,
} from "@/config/safe-automation";

export function SafeAutomationModel({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <section
      id="safe-automation"
      aria-labelledby="safe-automation-heading"
      className="border-y border-border bg-surface px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-accent">Safe automation</p>
        <h2
          id="safe-automation-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
        >
          {SAFE_AUTOMATION_TAGLINE}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          MaintenanceOS is designed to automate intake and preparation without
          handing consequential authority to the model. These boundaries come
          from the signed product-claims register and remain pre-launch.
        </p>

        <ol className="mt-8 grid gap-4 lg:grid-cols-3">
          {safeAutomationStages.map((stage, index) => (
            <li key={stage.id} className="relative">
              <article className="mos-glass h-full p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent text-sm font-semibold text-accent"
                  >
                    {index + 1}
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    {stage.eyebrow}
                  </p>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{stage.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{stage.body}</p>
              </article>
              {index < safeAutomationStages.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-lg font-semibold text-accent lg:block"
                >
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        {!compact ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <article className="rounded-[var(--mos-radius-lg)] border border-border bg-paper p-5">
              <h3 className="text-base font-semibold text-ink">AI can automate</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
                {aiMayAutomate.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article className="rounded-[var(--mos-radius-lg)] border border-border bg-paper p-5">
              <h3 className="text-base font-semibold text-ink">
                Rules or people must clear
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
                {humanOrRuleGate.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          </div>
        ) : null}

        <div className="mt-6 rounded-[var(--mos-radius-lg)] border border-dashed border-border bg-paper p-5">
          <h3 className="text-sm font-semibold text-ink">The AI must never</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted sm:grid sm:grid-cols-3 sm:gap-x-6 sm:space-y-0">
            {safeAutomationNever.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
