import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { getPricingConfig } from "@/config/pricing";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  const pricing = getPricingConfig();

  return (
    <>
      <PageHero
        eyebrow={pricing.eyebrow || undefined}
        title={pricing.title}
        lede={pricing.lede}
      />
      <div className="mx-auto max-w-5xl px-4 py-12">
        {pricing.showTiers && "tiers" in pricing && pricing.tiers.length > 0 ? (
          <ul className="grid gap-6 md:grid-cols-3">
            {pricing.tiers.map((tier) => (
              <li
                key={tier.id}
                className="flex flex-col rounded-lg border border-border bg-surface p-6"
              >
                <h2 className="text-lg font-semibold text-ink">{tier.name}</h2>
                <p className="mt-2 text-2xl font-semibold text-ink">
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
                  className="mt-6 inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
                >
                  {tier.cta.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto max-w-3xl rounded-lg border border-border bg-surface p-8 text-center">
            <p className="text-lg font-semibold text-ink">
              {"cardTitle" in pricing
                ? pricing.cardTitle
                : pricing.fallbackCardTitle}
            </p>
            <p className="mt-2 text-muted">
              {"cardBody" in pricing
                ? pricing.cardBody
                : pricing.fallbackCardBody}
            </p>
            <CtaPair
              className="mt-8 justify-center"
              primaryHref={pricing.primaryCta.href}
              primaryLabel={pricing.primaryCta.label}
              secondaryHref={pricing.secondaryCta.href}
              secondaryLabel={pricing.secondaryCta.label}
            />
            <p className="mt-6 text-xs text-muted">
              No self-serve checkout. Packages are shared on request while we
              prepare launch.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
