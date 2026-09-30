import type { Metadata } from "next";
import { CtaPair } from "@/components/CtaPair";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { faqItems } from "@/content/faqs";
import { faqPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = contentPageMetadata({
  title: "FAQ",
  description:

    "Website URL → check → configure → review → interactive receptionist demo → optional save. Straight answers on scan honesty, empty hours/services, UK 999, pricing, contact, security, and cookies. Pre-launch. Not a live phone.",

  path: "/faq/",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd()} />
      <PageHero
        title="Frequently asked questions"

        lede="Same path as Create from website: website URL → check → configure → review → interactive receptionist demo → optional save. No live phone, no invented crawl, and no engineering test-harness wording."

      />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <FunnelPathStrip />
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              name="mos-site-faq"
              className="mos-glass p-4"
            >
              <summary className="cursor-pointer font-semibold text-ink">
                {item.question}
              </summary>
              <p className="mt-3 text-muted">{item.answer}</p>
              {item.relatedHref ? (
                <p className="mt-2 text-sm">
                  <a href={item.relatedHref} className="text-accent underline">
                    {item.relatedLabel}
                  </a>
                </p>
              ) : null}
            </details>
          ))}
        </div>
        <CtaPair className="pt-4" />
      </div>
    </>
  );
}
