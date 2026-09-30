import { CtaPair } from "@/components/CtaPair";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { HowItWorksFlow } from "@/components/HowItWorksFlow";
import { JsonLd } from "@/components/JsonLd";
import { ObjectionFaq } from "@/components/ObjectionFaq";
import { PageHero } from "@/components/PageHero";
import { ProductTour } from "@/components/ProductTour";
import { SafeAutomationModel } from "@/components/SafeAutomationModel";
import { funnelPageJsonLd } from "@/lib/json-ld";
import { funnelPageMetadata } from "@/lib/page-meta";

export const metadata = funnelPageMetadata("howItWorks");


export default function HowItWorksPage() {
  return (
    <>
      <JsonLd data={funnelPageJsonLd("howItWorks")} />
      <PageHero
        eyebrow="Pre-launch. Not a public live service yet."
        title="From maintenance request to controlled follow-up."

        lede="See how MaintenanceOS is designed to capture a request, structure the work, escalate critical cases, and keep human oversight. The website path is Website → Check → Choose → Configure → Review & Try, followed by an optional saved reference. We do not invent crawl results, bookings, or a live phone number."

        orbAccent
      />

      <div className="mx-auto max-w-3xl px-4 pt-8">
        <FunnelPathStrip />
      </div>

      <HowItWorksFlow />

      <section
        id="product-tour"
        aria-labelledby="product-tour-heading"
        className="mx-auto max-w-3xl px-4 py-12 sm:py-16"
      >
        <h2
          id="product-tour-heading"
          className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
        >
          Product tour
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          A short walkthrough of website → check → review → pack, then how
          intake and rules are designed to work. Click to play — nothing
          autoplays. Captions are English (UK). This is not a live phone demo.
        </p>
        <div className="mt-6">
          <ProductTour />
        </div>
      </section>

      <SafeAutomationModel />

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
            Calendar connection is not active in the public preview. The interactive receptionist demo is available after the reviewed configuration is generated. Live always-on phone remains coming — frozen production
            telephony is not used here. Further controlled live testing is
            still required before we claim a public always-on receptionist.
          </p>
          <p className="mt-6 text-sm">
            <a
              href="/features/"
              className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
            >
              See VERIFIED / PREVIEW
            </a>
          </p>
        </div>
      </section>

      <ObjectionFaq headingId="hiw-objection-faq-heading" />

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
