import type { Metadata } from "next";
import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { ProductLine } from "@/components/ProductLine";
import { JsonLd } from "@/components/JsonLd";
import { contentPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = contentPageMetadata({
  title: "About",
  description:
    "WorkSmartOS is the brand. MaintenanceOS is its property-maintenance product, with fixed safety rules and human clearance. Pre-launch.",
  path: "/about/",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={contentPageJsonLd("/about/", "About", "WorkSmartOS is the brand. MaintenanceOS is its property-maintenance product, with fixed safety rules and human clearance. Pre-launch.", [
          { name: "About", path: "/about/" },
        ])}
      />
      <PageHero
        eyebrow="WorkSmartOS · United Kingdom"
        title="WorkSmartOS is the brand"
        lede="MaintenanceOS is a WorkSmartOS product. Chapelgate builds it so UK property maintenance stays accountable, auditable, and safe."
      />
      <ProductLine />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 text-sm text-muted">
        <section aria-labelledby="about-mission" className="space-y-3">
          <h2 id="about-mission" className="text-lg font-semibold text-ink">
            Our mission
          </h2>
          <p>
            Chapelgate is building MaintenanceOS so repair intake stays auditable. Fixed safety rules and authorised human clearance sit above AI assistance — ensuring AI never holds final authority over safety or money.
          </p>
        </section>

        <section aria-labelledby="about-uk" className="space-y-3">
          <h2 id="about-uk" className="text-lg font-semibold text-ink">
            UK operations focus
          </h2>
          <p>
            Designed specifically for United Kingdom property operations. The industry pages describe MaintenanceOS audiences. Any other sector modules remain separate planned products that are not live.
          </p>
        </section>

        <section aria-labelledby="about-honesty" className="space-y-3">
          <h2 id="about-honesty" className="text-lg font-semibold text-ink">
            Public honesty
          </h2>
          <p>
            We are pre-launch. We do not invent team bios, fake customer logos, awards, or uptime percentages. Technical controls are proven in source code.
          </p>
        </section>

        <div className="pt-4 border-t border-border">
          <CtaPair />
        </div>

        <p className="mt-8 text-sm text-muted">
          Related pre-launch pages:{" "}
          <a href="/help/" className="font-medium text-accent underline-offset-4 hover:underline">Help</a>
          {" · "}
          <a href="/trust/" className="font-medium text-accent underline-offset-4 hover:underline">Trust</a>
          {" · "}
          <a href="/security/" className="font-medium text-accent underline-offset-4 hover:underline">Security</a>
          {" · "}
          <a href="/contact/" className="font-medium text-accent underline-offset-4 hover:underline">Contact</a>
          . Documentation surfaces only — not a live company support desk.
        </p>
      </div>
    </>
  );
}
