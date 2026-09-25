import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { REFERRER_POLICY } from "@/lib/static-security-headers";
import { absoluteUrl, getCanonicalSiteUrl } from "@/lib/site-url";

/** Canonical public path named in funnel-page titles, descriptions, and OG. */
export const FUNNEL_PATH_LABEL =
  "Website → Check → Review → Pack → optional sandbox → early access";

const FUNNEL_META_GUARD =
  "Pre-launch — not a live phone, not always-on, not general availability.";

const defaultTitle = `${siteConfig.publicBrand} — UK maintenance operations software`;

function ogLocale(): string {
  return siteConfig.locale.replace("-", "_");
}

/**
 * Claims-safe title/description for funnel routes.
 * Path: website → check → review → pack → optional sandbox → early access.
 * Do not imply a live phone, always-on line, or general availability.
 */
export const funnelPageCopy = {
  home: {
    title: "UK maintenance operations software",
    absoluteTitle: `${siteConfig.publicBrand} — UK maintenance operations software`,
    description: `${siteConfig.publicBrand} is pre-launch UK maintenance operations software with AI-assisted intake for landlords, agents, managers, and maintenance teams. ${FUNNEL_PATH_LABEL}. ${FUNNEL_META_GUARD}`,
    path: "/",
  },
  create: {
    title: "Create maintenance intake from your website",
    description: `${FUNNEL_PATH_LABEL}. Build and review a maintenance intake draft from a public business website. Pre-launch — not a live phone number; this form does not provision one.`,
    path: "/create/",
  },
  demo: {
    title: "Start from your website — or request early access",
    description: `${FUNNEL_PATH_LABEL}. Create from your site, or request a human briefing. Pre-launch — not a live phone number.`,
    path: "/demo/",
  },
  howItWorks: {
    title: "How MaintenanceOS works",
    description: `${FUNNEL_PATH_LABEL}. Optional scripted sandbox is under testing. Deterministic rules own safety and money. Pre-launch — not a live phone.`,
    path: "/how-it-works/",
  },
  features: {
    title: "Maintenance operations software features",
    description: `VERIFIED / UNDER TEST: ${FUNNEL_PATH_LABEL}. Flagged sandbox and calendars; live phone not on this site. Pre-launch — not a live phone or commercial general availability.`,
    path: "/features/",
  },
} as const;

/** Root metadata for the static marketing export. Indexable; copy stays pre-launch. */
export function buildRootMetadata(): Metadata {
  const origin = getCanonicalSiteUrl();
  const home = `${origin}/`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: defaultTitle,
      template: `%s · ${siteConfig.publicBrand}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.publicBrand,
    referrer: REFERRER_POLICY,
    robots: { index: true, follow: true },
    alternates: { canonical: home },
    openGraph: {
      type: "website",
      locale: ogLocale(),
      url: home,
      siteName: siteConfig.publicBrand,
      title: defaultTitle,
      description: siteConfig.description,
    },
    twitter: {
      card: "summary",
      title: defaultTitle,
      description: siteConfig.description,
    },
  };
}

/** Page-level SEO chrome for content routes (title, description, canonical, OG, Twitter). */
export function contentPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  /** When set, document/OG/Twitter titles skip the `%s · MaintenanceOS` template. */
  absoluteTitle?: string;
}): Metadata {
  const path = opts.path.endsWith("/") ? opts.path : `${opts.path}/`;
  const canonical = absoluteUrl(path);
  const ogTitle = opts.absoluteTitle ?? `${opts.title} · ${siteConfig.publicBrand}`;

  return {
    title: opts.absoluteTitle
      ? { absolute: opts.absoluteTitle }
      : opts.title,
    description: opts.description,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: opts.description,
      url: canonical,
      siteName: siteConfig.publicBrand,
      locale: ogLocale(),
      type: "website",
    },
    twitter: {
      card: "summary",
      title: ogTitle,
      description: opts.description,
    },
  };
}

export function funnelPageMetadata(
  page: keyof typeof funnelPageCopy,
): Metadata {
  return contentPageMetadata(funnelPageCopy[page]);
}

export function industryRoleMetadata(
  role:
    | {
        slug: string;
        label: string;
        productName?: string;
        metaDescription: string;
      }
    | undefined,
): Metadata {
  if (!role) {
    return contentPageMetadata({
      title: "Industries",
      description:
        "Industry OS lines for UK landlords, agents, managers, housing, FM, councils, and holiday lets. Pre-launch.",
      path: "/industries/",
    });
  }
  return contentPageMetadata({
    title: role.productName ?? role.label,
    description: role.metaDescription,
    path: `/industries/${role.slug}/`,
  });
}
