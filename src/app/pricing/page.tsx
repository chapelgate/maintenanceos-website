import { CtaPair } from "@/components/CtaPair";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { getPricingConfig } from "@/config/pricing";
import { contentPageMetadata } from "@/lib/page-meta";
import { pricingPageProductJsonLd } from "@/lib/json-ld";

export const metadata = contentPageMetadata({
  title: "Pricing",
  description:
    "Packages for UK landlords, letting agents, property managers. No self-serve checkout — request a quote. No live phone in any plan.",
  path: "/pricing/",
});

export const dynamic = "force-static";

const designedToInclude = [
  "Website Intake: Captures repair facts in natural UK terminology.",
  "Fixed Safety Latches: Rules hold critical hazards for human clearance.",
  "Audit Evidence: Full activity logs without client-money authority.",
] as const;

const notSoldAsLive = [
  "No live phone in a plan (not a live public phone)",
  "No self-serve checkout and no invented list prices",
  "Calendar booking: coming / early access — not general availability",
] as const;

function TierCard({ tier, index }: { tier: { id: string; name: string; priceLabel: string; blurb: string; features: string[]; cta: { href: string; label: string } }; index: number }) {
  const isPopular = tier.id === "professional";
  return (
    <div
      className={`relative rounded-[var(--mos-radius-lg)] border border-border bg-surface p-6 space-y-4 flex flex-col ${
        isPopular ? "ring-2 ring-accent" : ""
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-on-accent">
          Most popular
        </span>
      )}
      <div>
        <h3 className="text-lg font-semibold text-ink">{tier.name}</h3>
        <p className="mt-1 text-sm text-muted">{tier.blurb}</p>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-ink">{tier.priceLabel}</span>
      </div>
      <ul className="space-y-2 text-sm text-muted" role="list">
        {tier.features.map((feature, i) => (
          <li key={i} className="flex gap-2">
            <svg className="flex-shrink-0 mt-0.5 h-4 w-4 text-accent" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-4">
        <a
          href={tier.cta.href}
          className={`inline-flex w-full min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-colors ${
            isPopular
              ? "bg-accent text-on-accent hover:bg-accent-hover"
              : "border border-border bg-surface text-ink hover:border-accent"
          }`}
        >
          {tier.cta.label}
        </a>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const pricing = getPricingConfig();
  const showTiers = pricing.mode === "published" && pricing.showTiers;

  return (
    <>
      <JsonLd data={pricingPageProductJsonLd()} />
      <PageHero
        eyebrow={pricing.eyebrow || undefined}
        title={pricing.title}
        lede={pricing.lede}
      />
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
        <FunnelPathStrip linked />

        {showTiers ? (
          <>
            <section aria-labelledby="tiers-heading" className="space-y-6">
              <h2 id="tiers-heading" className="sr-only">
                Pricing tiers
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pricing.tiers.map((tier, index) => (
                  <TierCard key={tier.id} tier={tier} index={index} />
                ))}
              </div>
              <p className="text-center text-sm text-muted">
                All tiers: no self-serve checkout, no live phone in a plan. Prices shown are indicative — final quote provided on request.
              </p>
            </section>
          </>
        ) : (
          <>
            <div className="rounded-[var(--mos-radius-lg)] border border-border bg-surface p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                {pricing.mode === "prelaunch" ? "Pre-launch" : "Pricing"}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink">
                {pricing.mode === "prelaunch" ? (pricing.cardTitle || "Request pricing") : pricing.fallbackCardTitle}
              </h2>
              <p className="mt-2 text-sm text-muted max-w-md mx-auto">
                {pricing.mode === "prelaunch"
                  ? (pricing.cardBody ||
                      "MaintenanceOS is pre-launch — not generally available. We will share packages suited to UK landlords, letting agents, and property managers when early access opens — no self-serve checkout and no published price list on this site.")
                  : pricing.fallbackCardBody}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href={pricing.primaryCta.href}
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
                >
                  {pricing.primaryCta.label}
                </a>
                <a
                  href={pricing.secondaryCta.href}
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent"
                >
                  {pricing.secondaryCta.label}
                </a>
              </div>
              <div className="hidden">
                <CtaPair />
              </div>
            </div>
          </>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5 space-y-3">
            <h2 className="text-base font-semibold text-ink">
              Designed to include
            </h2>
            <ul className="space-y-2 text-xs text-muted">
              {designedToInclude.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5 space-y-3">
            <h2 className="text-base font-semibold text-ink">
              Not sold as live yet
            </h2>
            <ul className="space-y-2 text-xs text-muted">
              {notSoldAsLive.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </section>

        <p className="mt-8 text-sm text-muted">
          Related pre-launch pages:{" "}
          <a href="/help/" className="font-medium text-accent underline-offset-4 hover:underline">Help</a>
          {" · "}
          <a href="/trust/" className="font-medium text-accent underline-offset-4 hover:underline">Trust</a>
          {" · "}
          <a href="/security/" className="font-medium text-accent underline-offset-4 hover:underline">Security</a>
          {" · "}
          <a href="/contact/" className="font-medium text-accent underline-offset-4 hover:underline">Contact</a>
          . Documentation surfaces only — not a live pricing support desk, and not a published price list.
        </p>
      </div>
    </>
  );
}