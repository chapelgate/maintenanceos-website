import { FeatureStatusChip } from "@/components/FeatureStatusChip";
import { IntakeOrbAccent } from "@/components/IntakeOrbAccent";
import { CREATE_JOURNEY_STEPS } from "@/lib/onboarding-create";

/**
 * Home uses the same five /create steps. UNDER TEST only. Not a live phone.
 */
const STEP_COPY = [
  {
    body: "A public URL and an email. Checking a site does not assign a live phone number.",
    href: "/create/",
    link: "Start from your website",
  },
  {
    body: "Missing details stay blank.",
    href: "/create/",
    link: "Check a website",
  },
  {
    body: "One role. No phone number is provisioned.",
    href: "/create/",
    link: "Choose a role",
  },
  {
    body: "Empty hours or services stay empty.",
    href: "/create/",
    link: "Configure the draft",
  },
  {
    body: "Try the reviewed draft in the browser.",
    href: "/create/",
    link: "Review and try",
  },
] as const;

const STEPS = CREATE_JOURNEY_STEPS.map((step, index) => ({
  title: step.label,
  ...STEP_COPY[index],
}));

export function HomeOnboardingSteps() {
  return (
    <section
      id="path"
      aria-labelledby="home-onboarding-heading"
      className="border-b border-border bg-surface px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="section-band-head">
          <IntakeOrbAccent />
          <div>
            <h2
              id="home-onboarding-heading"
              className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
            >
              How to start — five steps
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              Same public path as{" "}
              <a
                href="/create/"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                the website setup preview
              </a>
              : {CREATE_JOURNEY_STEPS.map((step) => step.label).join(" → ")}.
            </p>
          </div>
        </div>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
