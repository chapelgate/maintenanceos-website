import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getIndustrySeoIntent } from "@/config/seo-intents";
import { REFERRER_POLICY } from "@/lib/static-security-headers";
import { absoluteUrl, getCanonicalSiteUrl } from "@/lib/site-url";

/** Static file URL: no trailing slash (absoluteUrl adds one for routes). */
const OG_IMAGE_URL = () => `${getCanonicalSiteUrl().replace(/\/$/, "")}/og-image.webp`;

/** Canonical public path named in funnel-page titles, descriptions, and OG. */
export const FUNNEL_PATH_LABEL =
  "Website → Check → Choose → Configure → Review & Try";

const defaultTitle = siteConfig.publicBrand;

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
    title: "Repair Intake With Safety Rules for UK Teams",
    absoluteTitle: "Repair Intake With Safety Rules for UK Teams | WorkSmartOS",
    description:
      "The AI takes the details; fixed rules and an authorised person decide anything dangerous. UK property teams. Pre-launch; not a live phone; no SLA claim.",
    path: "/",
  },
  create: {
    title: "Try Website Set-up (Preview)",
    description:
      "Preview a repair-intake draft from your business details. No phone number created. Pre-launch; not always-on; not general availability; no SLA claim.",
    path: "/create/",
  },
  demo: {
    title: "Request an Early Demo",
    description: "Sample repair report from first contact to safety latch to clearance. Request an early demo. Pre-launch; not a live phone; no SLA claim.",
    path: "/demo/",
  },
  howItWorks: {
    title: "How MaintenanceOS Works: From Repair Report to Decision",
    description: "How a repair report becomes a structured request and safety-critical items stay with an authorised person. Pre-launch; not a live phone; no SLA claim.",
    path: "/how-it-works/",
  },
  features: {
    title: "MaintenanceOS Features: What's Built and What's in Preview",
    description: "What MaintenanceOS does today — structured repair intake, safety latches, audit evidence — and what's under testing. Pre-launch; not a live phone; no SLA claim.",
    path: "/features/",
  },
  propertyMaintenanceSoftware: {
    title: "Property Maintenance Software for UK Teams",
    absoluteTitle: "Property Maintenance Software for UK Teams | WorkSmartOS",
    description: "Pre-launch property maintenance software for UK landlords, agents, housing providers and maintenance firms. Not a live phone; no SLA claim.",
    path: "/property-maintenance-software/",
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
      template: `%s | ${siteConfig.publicBrand}`,
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
      images: [
        {
          url: OG_IMAGE_URL(),
          width: 1200,
          height: 630,
          alt: siteConfig.publicBrand,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: siteConfig.description,
      images: [OG_IMAGE_URL()],
    },
  };
}

/** Page-level SEO chrome for content routes (title, description, canonical, OG, Twitter). */
export function contentPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  /** When set, document/OG/Twitter titles skip the `%s | WorkSmartOS` template. */
  absoluteTitle?: string;
}): Metadata {
  const path = opts.path.endsWith("/") ? opts.path : `${opts.path}/`;
  const canonical = absoluteUrl(path);
  const ogTitle = opts.absoluteTitle ?? `${opts.title} | ${siteConfig.publicBrand}`;

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
      images: [
        {
          url: OG_IMAGE_URL(),
          width: 1200,
          height: 630,
          alt: siteConfig.publicBrand,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: opts.description,
      images: [OG_IMAGE_URL()],
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
        "Industry OS lines for UK landlords, agents, managers, housing, FM, councils, and holiday lets. Pre-launch; not a live phone; no SLA claim.",
      path: "/industries/",
    });
  }
  const seo = getIndustrySeoIntent(role.slug);
  return contentPageMetadata({
    title: seo?.title ?? role.productName ?? role.label,
    description: seo ? `${seo.summary} Pre-launch; not a live phone; no SLA claim.` : role.metaDescription,
    path: `/industries/${role.slug}/`,
  });
}
