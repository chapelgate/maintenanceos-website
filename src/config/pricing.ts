/**
 * Config-driven /pricing. Behaviour follows siteConfig.publicLaunch.
 * Never invent list prices, tiers, or checkout — only show published tiers
 * when explicitly filled below AND PUBLIC_LAUNCH is true.
 */
import { siteConfig } from "@/config/site";

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
    "Public list pricing is not published yet. Request pricing or an early demo while we prepare launch.",
  cardTitle: "Request pricing",
  cardBody:
    "MaintenanceOS is pre-launch. We will share packages suited to UK landlords, letting agents, and property managers when early access opens — no self-serve checkout on this site.",
  notes: [
    "Packages tailored to portfolio size and workflow",
    "Human clearance stays on safety and money decisions",
    "No self-serve checkout on this marketing site",
  ] as const,
  primaryCta: {
    href: "/demo/",
    label: "Request pricing",
  } satisfies PricingCta,
  secondaryCta: {
    href: "/demo/",
    label: "Request an early demo",
  } satisfies PricingCta,
} as const;

/**
 * Published-mode copy. Keep `tiers` empty until real packages are approved.
 * An empty tiers array falls back to the same request-pricing card (no fake prices).
 */
const published = {
  eyebrow: "",
  title: "Pricing",
  lede:
    "Packages for UK landlords, letting agents, and property managers. No self-serve checkout on this site — request a quote if you need a tailored plan.",
  /** Fill only with verified, approved package copy. Empty = still request pricing. */
  tiers: [] as PricingTier[],
  fallbackCardTitle: "Request a quote",
  fallbackCardBody:
    "List packages are not on this page yet. Request pricing and we will share what fits your portfolio.",
  notes: [
    "Quote-led packaging — no invented list prices here",
    "Human clearance stays on safety and money decisions",
  ] as const,
  primaryCta: {
    href: "/demo/",
    label: "Request pricing",
  } satisfies PricingCta,
  secondaryCta: {
    href: "/demo/",
    label: "Request an early demo",
  } satisfies PricingCta,
} as const;

export function getPricingMode(): PricingMode {
  return siteConfig.publicLaunch ? "published" : "prelaunch";
}

export function getPricingConfig() {
  const mode = getPricingMode();
  if (mode === "published") {
    const hasTiers = published.tiers.some((t) => t.priceLabel.trim().length > 0);
    return {
      mode,
      ...published,
      showTiers: hasTiers,
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
