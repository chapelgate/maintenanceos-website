import { CtaPair } from "@/components/CtaPair";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { UkScenarioVignettes } from "@/components/UkScenarioVignettes";
import { HowItWorksFlow } from "@/components/HowItWorksFlow";
import { IntakeJourneyFlow } from "@/components/IntakeJourneyFlow";
import { JsonLd } from "@/components/JsonLd";
import { ObjectionFaq } from "@/components/ObjectionFaq";
import { PageHero } from "@/components/PageHero";
import { ProductTour } from "@/components/ProductTour";
import { SafeAutomationLink } from "@/components/SafeAutomationLink";
import { fullFunnelPageJsonLd } from "@/lib/json-ld";
import { funnelPageMetadata } from "@/lib/page-meta";

export const metadata = funnelPageMetadata("howItWorks");

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd data={fullFunnelPageJsonLd("howItWorks")} />
      <PageHero
        eyebrow="Pre-launch · Preview"
        title="From maintenance request to controlled follow-up."
        lede="Designed to capture maintenance requests in natural UK terminology when voice intake is enabled — not a live always-on phone. The website path is Website → Check → Choose → Configure → Review & Try. Fixed server rules evaluate hazards, create work orders, or latch critical repairs for authorised human clearance."
      />

      <div className="mx-auto max-w-3xl px-4 pt-8">
        <FunnelPathStrip />
      </div>

      <IntakeJourneyFlow />

      <HowItWorksFlow />

      <UkScenarioVignettes />

      <section
        id="product-tour"
        aria-labelledby="product-tour-heading"
        className="mx-auto max-w-3xl px-4 py-8 sm:py-12"
      >
        <h2
          id="product-tour-heading"
          className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
        >
          Product tour
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          A short walkthrough of website learning and the browser voice receptionist. Click to play. Not a live public phone number.
        </p>
        <div className="mt-4">
          <ProductTour />
        </div>
      </section>

      <SafeAutomationLink />

      <ObjectionFaq headingId="objections" />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <CtaPair primaryHref="/demo/" primaryLabel="Request an early demo" />
      </div>
    </>
  );
}
