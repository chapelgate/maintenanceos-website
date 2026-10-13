import { Accordion } from "@/components/Accordion";
import { BentoCard } from "@/components/BentoCard";
import { CtaPair } from "@/components/CtaPair";
import { GasSafetyBlock } from "@/components/GasSafetyBlock";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import {
  ukMaintenanceVsGeneric,
  type IndustryRole,
} from "@/config/industries";
import { getIndustrySeoIntent } from "@/config/seo-intents";
import { industryPageJsonLd } from "@/lib/json-ld";

type Props = { role: IndustryRole };

const GAS_BLOCK_SLUGS = new Set([
  "landlords",
  "letting-agents",
  "housing-associations",
  "councils",
]);

export function IndustryRolePage({ role }: Props) {
  const seo = getIndustrySeoIntent(role.slug);

  return (
    <>
      <JsonLd data={industryPageJsonLd(role.slug)} />
      <PageHero
        eyebrow={`Industries · ${role.productName}`}
        title={role.title}
        lede={role.sub}
      />
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-12">
        <p className="text-xs text-muted">
          <a
            href="/industries/#core-safety"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Pre-launch status: under testing; not a live phone.
          </a>
        </p>

        {GAS_BLOCK_SLUGS.has(role.slug) ? <GasSafetyBlock /> : null}

        {/* 1. Sector Key Benefits (3 Cards) */}
        {role.benefits && role.benefits.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-ink">Sector key benefits</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {role.benefits.map((b) => (
                <BentoCard
                  key={b.title}
                  title={b.title}
                  description={b.desc}
                />
              ))}
            </div>
          </section>
        )}

        {/* 2. The Safety Boundary */}
        <section className="rounded-[var(--mos-radius-lg)] border border-border bg-surface p-4 sm:p-5 space-y-2">
          <h2 className="text-base font-semibold text-ink">The safety boundary</h2>
          <div className="grid gap-3 sm:grid-cols-2 pt-1 text-xs text-muted">
            <div className="rounded-lg border border-border bg-paper/50 p-3">
              <span className="font-bold text-accent uppercase tracking-wide">
                Assistant captures
              </span>
              <p className="mt-1">
                Caller identity, property details, and repair descriptions.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-paper/50 p-3">
              <span className="font-bold text-ink uppercase tracking-wide">
                Team clears
              </span>
              <p className="mt-1">
                Critical safety latches, emergency hazards, budgets, and dispatches.
              </p>
            </div>
          </div>
        </section>

        {/* 3. UK Maintenance vs Generic Receptionist */}
        <section className="space-y-4 border-t border-border pt-8">
          <h2 className="text-xl font-semibold text-ink">
            UK maintenance — not a generic AI receptionist
          </h2>
          <p className="text-xs text-muted">
            Generic receptionist tools answer phones. {role.productName} is
            written for UK property-maintenance operations. Positioning only —
            voice remains in commissioning preview; not commercial general availability.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {ukMaintenanceVsGeneric.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-surface p-3.5 text-xs text-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* 4. Common Questions (3 Collapsible Accordions) */}
        {role.faq && role.faq.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-ink">
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {role.faq.slice(0, 3).map((item) => (
                <Accordion key={item.q} summary={item.q}>
                  <p>{item.a}</p>
                </Accordion>
              ))}
            </div>
          </section>
        )}

        {/* 5. Core Category SEO Intent Link */}
        {seo ? (
          <section className="text-xs text-muted">
            <p>
              Core category:{" "}
              <a
                href="/property-maintenance-software/"
                className="text-accent underline"
              >
                property maintenance software
              </a>
              .
            </p>
          </section>
        ) : null}

        {/* 6. Early Demo CTA */}
        <section className="space-y-4 border-t border-border pt-8">
          <CtaPair
            primaryHref="/demo/"
            primaryLabel="Request an early demo"
            secondaryHref="/how-we-keep-control/"
            secondaryLabel="See the safety rules"
          />
          <p className="text-xs text-muted">
            <a href="/industries/" className="text-accent underline">
              All sectors
            </a>
          </p>
        </section>
      </div>
    </>
  );
}
