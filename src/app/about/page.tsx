import type { Metadata } from "next";
import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = contentPageMetadata({
  title: "About MaintenanceOS",
  description:
    "Why MaintenanceOS is built the way it is: fixed safety rules, human clearance, and transparent operations. Pre-launch.",
  path: "/about/",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Chapelgate · United Kingdom"
        title="Why MaintenanceOS is built the way it is"
        lede="Chapelgate builds operations software so UK property maintenance stays accountable, auditable, and safe."
      />
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
      </div>
    </>
  );
}
