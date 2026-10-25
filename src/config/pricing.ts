/**
 * Config-driven /pricing. Behaviour follows siteConfig.publicLaunch.
 * Never invent list prices, tiers, or checkout — published tiers only when
 * explicitly filled below AND PUBLIC_LAUNCH is true.
 */
import { siteConfig } from "@/config/site";
import { isPublishablePriceLabel } from "@/lib/publishable-price";

export type PricingCta = {
  href: string;
  label: string;
};

export type PricingTier = {
  id: string;
  name: string;
  /** Human-readable price string only — leave empty until real packages exist. */
  priceLabel: string;
  blurb: string;
  features: string[];
  cta: PricingCta;
};

export type PricingMode = "prelaunch" | "published";

const prelaunch = {
  eyebrow: "Launching soon",
  title: "Pricing",
  lede:
    "Public list pricing is not published yet. Start from your website, or request pricing / early access while we prepare launch. No live phone is included in a plan.",
  cardTitle: "Request pricing",
  cardBody:
    "MaintenanceOS is pre-launch — not generally available. We will share packages suited to UK landlords, letting agents, and property managers when early access opens — no self-serve checkout and no published price list on this site.",
  notes: [
    "Packages tailored to portfolio size and workflow — shared on request",
    "Human clearance stays on safety and money decisions",
    "No self-serve checkout on this marketing site",
    "Live phone and calendar booking: coming / early access — not included as a live plan",
  ] as const,
  primaryCta: {
    href: "/demo/",
    label: "Request an early demo",
  } satisfies PricingCta,
  secondaryCta: {
    href: "/demo/#demo",
    label: "Request early access",
  } satisfies PricingCta,
} as const;

/**
 * Published-mode copy. Tiers are populated with Andy-approved prices only.
 * Empty or placeholder prices fall back to the request-pricing card (no fake prices).
 * Andy must confirm: tier names, prices, unit/period, and feature lists.
 */
const published = {
  eyebrow: "",
  title: "Pricing",
  lede:
    "Packages for UK landlords, letting agents, and property managers. No self-serve checkout on this site — request a quote if you need a tailored plan. No live phone is included in a plan.",
  tiers: [
    {
      id: "starter",
      name: "Starter",
      priceLabel: "[ANDY: Starter tier price — e.g. XX/month per property]",
      blurb: "For small portfolios getting started with structured intake.",
      features: [
        "Website intake for repair reports",
        "Safety latches on critical hazards",
        "Audit logs (read-only)",
        "Email support",
      ],
      cta: {
        href: "/demo/",
        label: "Request Starter demo",
      },
    },
    {
      id: "professional",
      name: "Professional",
      priceLabel: "[ANDY: Professional tier price — e.g. XX/month per property]",
      blurb: "For growing letting agents and property managers.",
      features: [
        "Everything in Starter",
        "Multi-property dashboard",
        "Team member access",
        "Priority email support",
        "API access (read)",
      ],
      cta: {
        href: "/demo/",
        label: "Request Professional demo",
      },
    },
    {
      id: "enterprise",
      name: "Enterprise",
      priceLabel: "[ANDY: Enterprise tier price — e.g. XX/month per property]",
      blurb: "For large portfolios and housing associations.",
      features: [
        "Everything in Professional",
        "Unlimited properties",
        "SSO / SAML",
        "Dedicated support channel",
        "API access (read/write)",
        "Custom safety rules",
      ],
      cta: {
        href: "/demo/",
        label: "Request Enterprise demo",
      },
    },
  ] as PricingTier[],
  fallbackCardTitle: "Request a quote",
  fallbackCardBody:
    "List packages are not on this page yet. Request pricing and we will share what fits your portfolio. No price list is published, and no live phone is included in a plan.",
  notes: [
    "Quote-led packaging — prices are shared on request",
    "Human clearance stays on safety and money decisions",
    "Live phone and calendar booking: coming / early access — not included as a live plan",
  ] as const,
  primaryCta: {
    href: "/demo/",
    label: "Request an early demo",
  } satisfies PricingCta,
  secondaryCta: {
    href: "/demo/#demo",
    label: "Request early access",
  } satisfies PricingCta,
} as const;

export function getPricingMode(): PricingMode {
  return siteConfig.publicLaunch ? "published" : "prelaunch";
}

export function getPricingConfig() {
  const mode = getPricingMode();
  if (mode === "published") {
    const allLabelsPublishable = published.tiers.every((t) => isPublishablePriceLabel(t.priceLabel));
    return {
      mode,
      ...published,
      showTiers: allLabelsPublishable,
    };
  }
  return {
    mode,
    ...prelaunch,
    showTiers: false,
    tiers: [] as PricingTier[],
  };
}

export const pricingConfig = {
  prelaunch,
  published,
} as const;
