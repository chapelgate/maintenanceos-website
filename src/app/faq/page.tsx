import type { Metadata } from "next";
import { Accordion } from "@/components/Accordion";
import { CtaPair } from "@/components/CtaPair";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { productFaqItems, safetyFaqItems } from "@/content/faqs";
import { fullFaqPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = contentPageMetadata({
  title: "FAQ: Safety, Data, Pricing and Status",
  description:
    "What the AI will and won't do, what counts as safety-critical, how data is kept apart, cookies, pricing and launch status.",
  path: "/faq/",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={fullFaqPageJsonLd()} />
      <PageHero
        title="Frequently asked questions"
        lede="The preview follows: website URL → website learning → review → configure → browser voice preview → optional save. Not a live phone, no invented facts, and no cert theatre."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
        <FunnelPathStrip linked />

        {/* Category 1: Product & Telephone Status */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-ink">
            Product & Telephone Status
          </h2>
          <div className="space-y-3">
            {productFaqItems.map((item) => (
              <Accordion key={item.question} summary={item.question} name="mos-site-faq">
                <p>{item.answer}</p>
                {item.relatedHref ? (
                  <p className="mt-2 text-xs">
                    <a href={item.relatedHref} className="text-accent underline">
                      {item.relatedLabel}
                    </a>
                  </p>
                ) : null}
              </Accordion>
            ))}
          </div>
        </section>

        {/* Category 2: Safety, Security & Privacy */}
        <section className="space-y-4 border-t border-border pt-8">
          <h2 className="text-xl font-semibold text-ink">
            Safety, Security & Privacy
          </h2>
          <div className="space-y-3">
            {safetyFaqItems.map((item) => (
              <Accordion key={item.question} summary={item.question} name="mos-site-faq">
                <p>{item.answer}</p>
                {item.relatedHref ? (
                  <p className="mt-2 text-xs">
                    <a href={item.relatedHref} className="text-accent underline">
                      {item.relatedLabel}
                    </a>
                  </p>
                ) : null}
              </Accordion>
            ))}
          </div>
        </section>

        <section className="border-t border-border pt-8">
          <CtaPair />
        </section>
      </div>
    </>
  );
}
