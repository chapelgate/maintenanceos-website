import type { Metadata } from "next";
import { CtaPair } from "@/components/CtaPair";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { faqItems } from "@/content/faqs";
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
        <FaqAccordion items={faqItems} />
        <section className="border-t border-border pt-8">
          <CtaPair />
        </section>
        <p className="mt-8 text-sm text-muted">
          Related pre-launch pages:{" "}
          <a href="/help/" className="font-medium text-accent underline-offset-4 hover:underline">Help</a>
          {" · "}
          <a href="/pricing/" className="font-medium text-accent underline-offset-4 hover:underline">Pricing</a>
          {" · "}
          <a href="/trust/" className="font-medium text-accent underline-offset-4 hover:underline">Trust</a>
          {" · "}
          <a href="/security/" className="font-medium text-accent underline-offset-4 hover:underline">Security</a>
          {" · "}
          <a href="/contact/" className="font-medium text-accent underline-offset-4 hover:underline">Contact</a>
          . Documentation surfaces only — not a live FAQ support desk.
        </p>
      </div>
    </>
  );
}