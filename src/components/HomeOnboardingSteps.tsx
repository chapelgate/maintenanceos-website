import { FeatureStatusChip } from "@/components/FeatureStatusChip";

/**
 * Skim-friendly 3-step start on home — Website → Review pack → Early access.
 * Deep-links to /create. UNDER TEST only. Not “go live in 30s”.
 */
const STEPS = [
  {
    title: "Website",
    body: "Paste a public business URL and an email. Checking a site does not assign a live phone number.",
    href: "/create/",
    link: "Start from your website",
  },
  {
    title: "Review pack",
    body: "Edit the draft. Empty hours or services stay empty — we do not invent crawl results.",
    href: "/create/",
    link: "See the review step",
  },
  {
    title: "Early access",
    body: "Submit the pack, join the launch list, or request a human briefing. None of these provision a live number.",
    href: "/demo/#demo",
    link: "Request early access",
  },
] as const;

export function HomeOnboardingSteps() {
  return (
    <section
      aria-labelledby="home-onboarding-heading"
      className="border-b border-border bg-surface px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="home-onboarding-heading"
          className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
        >
          How to start — three steps
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Same public path as{" "}
          <a
            href="/create/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Create from website
          </a>
          : website URL → review a draft pack → early access. Optional scripted
          sandbox stays under testing. No live phone demo.
        </p>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <article className="mos-glass flex h-full flex-col p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-accent bg-paper text-sm font-semibold text-accent"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <FeatureStatusChip status="UNDER_TEST" />
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink">
                  {step.body}
                </p>
                <p className="mt-4 text-sm">
                  <a
                    href={step.href}
                    className="font-semibold text-accent underline-offset-4 hover:underline"
                  >
                    {step.link}
                  </a>
                </p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
