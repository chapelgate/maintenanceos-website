import { CtaPair } from "@/components/CtaPair";
import { DemoConversionTabs } from "@/components/DemoConversionTabs";
import { DemoProof } from "@/components/DemoProof";
import { FeatureStatusChip } from "@/components/FeatureStatusChip";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { funnelPageJsonLd } from "@/lib/json-ld";
import { funnelPageMetadata } from "@/lib/page-meta";
import { CREATE_JOURNEY_STEPS } from "@/lib/onboarding-create";

export const metadata = funnelPageMetadata("demo");

const FUNNEL_COPY = [

  "Enter your public website and email to prepare the receptionist preview.",
  "We read a small, bounded set of public pages and extract business facts for review. Missing details stay blank rather than being invented.",
  "Choose one bounded AI role: receptionist, maintenance desk, booking assistant, customer service, sales/enquiry, or custom.",
  "Configure the role, review the business details, and generate the controlled knowledge pack.",
  "Press Try your receptionist and ask your own caller questions in the browser.",

] as const;

const pathSteps = [
  ...CREATE_JOURNEY_STEPS.map((step, i) => {
    const body = FUNNEL_COPY[i];
    if (!body) {
      throw new Error(`Missing /demo copy for ${step.label}`);
    }
    return { title: step.label, body, status: "UNDER_TEST" as const };
  }),
  {
    title: "Save setup (optional)",
    body: "Save the reviewed setup if you want a durable reference emailed to you. Saving is separate from the interactive demo.",
    status: "UNDER_TEST" as const,
  },
];

export default function DemoPage() {
  return (
    <>
      <JsonLd data={funnelPageJsonLd("demo")} />
      <PageHero
        eyebrow="Interactive product preview"
        title="Start from your website URL."
        lede="See the real website journey: website URL → check → choose role → configure → review and try. The interactive demo uses the reviewed knowledge pack in your browser. Saving the setup is optional and the live telephone service is separate."
      />

      <div className="mx-auto max-w-3xl px-4 pt-8">
        <FunnelPathStrip />
      </div>

      <DemoProof />

      <section
        aria-labelledby="demo-path-heading"
        className="mx-auto max-w-3xl px-4 pt-10"
      >
        <h2
          id="demo-path-heading"
          className="text-lg font-semibold text-ink"
        >
          The public path
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Same steps as <a href="/create/" className="text-accent underline">the website setup preview</a>:
          Website → Check → Choose → Configure → Review &amp; Try, then
          optional save. This browser preview does not assign a live number.

        </p>
        <ol className="mt-6 space-y-3">
          {pathSteps.map((step, i) => (
            <li key={step.title}>
              <article className="mos-glass bg-paper p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent bg-paper text-sm font-semibold text-accent"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-ink">
                    {step.title}
                  </h3>
                  <FeatureStatusChip status={step.status} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </article>
            </li>
          ))}
        </ol>

        <CtaPair className="mt-8" />
      </section>

      <section
        aria-labelledby="demo-not-heading"
        className="mx-auto max-w-3xl px-4 pt-10"
      >
        <h2 id="demo-not-heading" className="text-lg font-semibold text-ink">
          What this is not
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
          <li>Not a live telephone call or a public always-on phone line.</li>
          <li>Not live number provisioning.</li>
          <li>Not a production telephony GO.</li>
          <li>Not a promise of autonomous job booking or payments.</li>
        </ul>
      </section>

      <section
        aria-labelledby="demo-briefing-heading"
        className="mx-auto max-w-3xl px-4 pt-10"
      >
        <h2
          id="demo-briefing-heading"
          className="text-lg font-semibold text-ink"
        >
          Prefer a human briefing?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Use the briefing form below if you want to talk through the product
          with a person. This is separate from live number provisioning.
        </p>
      </section>
      <DemoConversionTabs />
    </>
  );
}
