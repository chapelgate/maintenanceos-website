import type { Metadata } from "next";
import { CtaPair } from "@/components/CtaPair";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { faqItems } from "@/content/faqs";
import { faqPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = contentPageMetadata({
  title: "FAQ",
  description:
    "Straight answers on MaintenanceOS readiness, AI authority, emergency guidance, and pricing — aligned with our product claims register. Pre-launch.",
  path: "/faq/",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd()} />
      <PageHero
        title="Frequently asked questions"
        lede="Straight answers aligned with our product claims register. No marketing spin on readiness."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="rounded-md border border-border bg-surface p-4"
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
