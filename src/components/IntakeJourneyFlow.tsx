export function IntakeJourneyFlow() {
  const steps = [
    {
      num: "01",
      title: "Caller Speaks",
      desc: "Natural UK terminology.",
    },
    {
      num: "02",
      title: "Audio Transcribed",
      desc: "Structured into job details.",
    },
    {
      num: "03",
      title: "Rule Engine",
      desc: "Fixed server safety checks.",
    },
    {
      num: "04",
      title: "Order or Latch",
      desc: "Human clears hazards.",
    },
  ];

  return (
    <section aria-labelledby="intake-journey-heading" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h2 id="intake-journey-heading" className="text-xl font-semibold tracking-tight text-ink sm:text-2xl mb-4">
        The Intake Journey
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, idx) => (
          <div
            key={step.num}
            className="mos-bento-card relative flex flex-col justify-between p-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent">STEP {step.num}</span>
                {idx < steps.length - 1 && (
                  <svg
                    className="hidden lg:block h-4 w-4 text-accent/60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </div>
              <h3 className="mt-2 text-sm font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
