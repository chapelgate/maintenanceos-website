import { CtaPair } from "@/components/CtaPair";
import { HowItWorksFlow } from "@/components/HowItWorksFlow";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "How MaintenanceOS is designed to work — Website to knowledge pack",
  description:
    "Website → Check → Review → Pack, then early access. Optional scripted sandbox is under testing. Deterministic rules own safety and money. Pre-launch — not a live phone.",
  path: "/how-it-works/",
});

const designedCallStages = [
  {
    title: "Intake",
    body: "The receptionist layer is designed to collect caller details and classify what it hears in UK property-maintenance language — including 999 guidance where relevant. Voice intake is under testing — not a public always-on service.",
  },
  {
    title: "Controlled triage",
    body: "Tenant isolation, lifecycle transitions, safety latching, escalation queues, and approvals sit in server rules. Consequential actions are not left to the model.",
  },
  {
    title: "Human oversight",
    body: "Explicit-request human transfer and human clearance keep judgement with your team. No autonomous dispatch, booking, or payment claims.",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="Pre-launch. Not a public live service yet."
        title="From your website URL to a sandbox receptionist pack."
        lede="Website → Check → Review → Pack, then request early access. An optional scripted sandbox sits after the pack when a local flag is on. We do not invent crawl results, bookings, or a live phone number."
      />

      <HowItWorksFlow />

      <section
        aria-labelledby="call-design-heading"
        className="mx-auto max-w-3xl px-4 py-12 sm:py-16"
      >
        <h2
          id="call-design-heading"
          className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
        >
          How a call is designed to work
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          After early access, the product is designed so AI assists at intake
          and classification. Authority for safety and money stays with system
          rules and people. This is designed behaviour — not a live always-on
          line.
        </p>
        <ol className="mt-8 space-y-6">
          {designedCallStages.map((stage, i) => (
            <li key={stage.title}>
              <p className="text-lg font-semibold tracking-tight text-ink">
                {i + 1}. {stage.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {stage.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="honesty-heading"
        className="border-y border-border bg-accent-subtle"
      >
        <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <h2
            id="honesty-heading"
            className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
          >
            Designed so marketing never outruns the product.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Calendar connect and the scripted sandbox are under testing and off
            by default. Live always-on phone remains coming — frozen production
            telephony is not used here. Further controlled live testing is
            still required before we claim a public always-on receptionist.
          </p>
          <p className="mt-6 text-sm">
            <a
              href="/features/"
              className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
            >
              See HAVE / UNDER TEST / COMING
            </a>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <CtaPair
          primaryHref="/create/"
          primaryLabel="Create from website"
          secondaryHref="/demo/#launch"
          secondaryLabel="Join launch list"
        />
      </div>
    </>
  );
}
