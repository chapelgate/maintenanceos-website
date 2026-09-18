import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { getPricingConfig } from "@/config/pricing";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Pricing",
  description:
    "Public list pricing is not published yet. Request pricing or join the launch list. Pre-launch — no self-serve checkout.",
  path: "/pricing/",
});

export default function PricingPage() {
  const pricing = getPricingConfig();

  return (
    <>
      <PageHero
        eyebrow={pricing.eyebrow || undefined}
        title={pricing.title}
        lede={pricing.lede}
      />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
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
                  className="mt-6 inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
                >
                  {tier.cta.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm ring-1 ring-accent/15 sm:p-10">
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
                No self-serve checkout. Packages are shared on request while we
                prepare launch.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
