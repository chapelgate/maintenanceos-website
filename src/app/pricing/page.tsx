import { CtaPair } from "@/components/CtaPair";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { PageHero } from "@/components/PageHero";
import { getPricingConfig } from "@/config/pricing";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Pricing",
  description:
    "List prices are not published yet. Request an early demo to talk through pricing. Pre-launch, not a live phone.",
  path: "/pricing/",
});

const designedToInclude = [
  "Website → Check → Choose → Configure → Review & Try onboarding (early access — not a live receptionist)",
  "UK maintenance intake language and 999 guidance (never 911) in product source",
  "Explicit-request human transfer in product source",
  "Fixed rules for safety, approvals, and money prohibitions",
  "Multi-tenant ops objects in source: properties, residents, contractors, work orders, jobs",
] as const;

const notSoldAsLive = [
  "No live always-on phone line in a plan",
  "No self-serve checkout and no invented list prices",
  "No price list is published on this marketing site",
  "Calendar booking and live telephony: coming / early access — not general availability",
  "No ISO, SOC 2, or bank-grade certification claims",
] as const;

export default function PricingPage() {
  const pricing = getPricingConfig();

  return (
    <>
      <PageHero
        eyebrow={pricing.eyebrow || undefined}
        title={pricing.title}
        lede={pricing.lede}
        orbAccent
      />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:py-16">
        <FunnelPathStrip linked />

        {pricing.showTiers && "tiers" in pricing && pricing.tiers.length > 0 ? (
          <ul className="grid gap-6 md:grid-cols-3">
            {pricing.tiers.map((tier) => (
              <li
                key={tier.id}
                className="flex flex-col rounded-xl border border-border bg-surface p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-ink">{tier.name}</h2>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {tier.priceLabel}
                </p>
                <p className="mt-2 text-sm text-muted">{tier.blurb}</p>
                {tier.features.length > 0 ? (
                  <ul className="mt-4 grow list-disc space-y-1 pl-5 text-sm text-ink">
                    {tier.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                ) : null}
                <a
                  href={tier.cta.href}
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
                >
                  {tier.cta.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto max-w-2xl">
            <div className="mos-glass p-8 text-center ring-1 ring-accent/15 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                Pre-launch
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-ink">
                {"cardTitle" in pricing
                  ? pricing.cardTitle
                  : pricing.fallbackCardTitle}
              </p>
              <p className="mx-auto mt-3 max-w-prose text-muted">
                {"cardBody" in pricing
                  ? pricing.cardBody
                  : pricing.fallbackCardBody}
              </p>
              {"notes" in pricing && pricing.notes.length > 0 ? (
                <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-ink">
                  {pricing.notes.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span
                        aria-hidden
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <CtaPair
                className="mt-8 justify-center"
                primaryHref={pricing.primaryCta.href}
                primaryLabel={pricing.primaryCta.label}
                secondaryHref={pricing.secondaryCta.href}
                secondaryLabel={pricing.secondaryCta.label}
              />
              <p className="mt-6 text-xs text-muted">
                No self-serve checkout. No live phone in a plan. Packages are
                shared on request while we prepare launch.
              </p>
            </div>
          </div>
        )}

        <section
          aria-labelledby="pricing-scope-heading"
          className="grid gap-4 md:grid-cols-2"
        >
          <div className="mos-glass p-6">
            <h2
              id="pricing-scope-heading"
              className="text-lg font-semibold text-ink"
            >
              Designed to include
            </h2>
            <p className="mt-2 text-sm text-muted">
              Conceptual scope of the programme — still pre-launch, not a
              buy-now live service.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              {designedToInclude.map((item) => (
                <li key={item} className="flex gap-2">
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mos-glass p-6">
            <h2 className="text-lg font-semibold text-ink">
              Not sold as live yet
            </h2>
            <p className="mt-2 text-sm text-muted">
              Explicit exclusions while we prepare launch. Request pricing — we
              will not invent a plan card.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              {notSoldAsLive.map((item) => (
                <li key={item} className="flex gap-2">
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
