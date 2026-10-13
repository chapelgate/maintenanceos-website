import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getIndustrySeoIntent } from "@/config/seo-intents";
import { REFERRER_POLICY } from "@/lib/static-security-headers";
import { absoluteUrl, getCanonicalSiteUrl } from "@/lib/site-url";

/** Static file URL: no trailing slash (absoluteUrl adds one for routes). */
const OG_IMAGE_URL = () => `${getCanonicalSiteUrl().replace(/\/$/, "")}/og-image.png`;

/** Canonical public path named in funnel-page titles, descriptions, and OG. */
export const FUNNEL_PATH_LABEL =
  "Website → Check → Choose → Configure → Review & Try";

const defaultTitle = `MaintenanceOS | WorkSmart OS`;

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
    absoluteTitle: "Repair Intake With Safety Rules for UK Teams | MaintenanceOS | WorkSmart OS",
    description: "The AI takes the details; fixed rules and an authorised person decide anything dangerous. For UK property teams. Pre-launch, not a live phone, not always-on.",
    path: "/",
  },
  create: {
    title: "Try Website Set-up (Preview)",
    description:
      "Preview a repair-intake draft from your business details. It does not create a phone number. Pre-launch, not always-on, not general availability.",
    path: "/create/",
  },
  demo: {
    title: "Request an Early Demo",
    description: "See a sample repair report go from first contact to safety latch to clearance, using sample data. Request an early demo of MaintenanceOS.",
    path: "/demo/",
  },
  howItWorks: {
    title: "How MaintenanceOS Works: From Repair Report to Decision",
    description: "How a repair report becomes a structured request, how safety-critical reports are held for an authorised person, and what's recorded along the way.",
    path: "/how-it-works/",
  },
  features: {
    title: "MaintenanceOS Features: What's Built and What's in Preview",
    description: "What MaintenanceOS does today, from structured repair intake to safety latches and audit evidence, and what's still under testing. Plainly labelled.",
    path: "/features/",
  },
  propertyMaintenanceSoftware: {
    title: "Property Maintenance Software for UK Teams",
    absoluteTitle: "Property Maintenance Software for UK Teams | MaintenanceOS | WorkSmart OS",
    description: "Pre-launch property maintenance software for UK landlords, agents, housing providers and maintenance firms. AI takes the details; rules and people keep control.",
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
      template: `%s | MaintenanceOS | WorkSmart OS`,
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
      siteName: siteConfig.parentBrand,
      title: defaultTitle,
      description: siteConfig.description,
      images: [OG_IMAGE_URL()],
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
  /** When set, document/OG/Twitter titles skip the `%s | MaintenanceOS | WorkSmart OS` template. */
  absoluteTitle?: string;
}): Metadata {
  const path = opts.path.endsWith("/") ? opts.path : `${opts.path}/`;
  const canonical = absoluteUrl(path);
  const ogTitle = opts.absoluteTitle ?? `${opts.title} | MaintenanceOS | WorkSmart OS`;

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
      siteName: siteConfig.parentBrand,
      locale: ogLocale(),
      type: "website",
      images: [OG_IMAGE_URL()],
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
        "Industry OS lines for UK landlords, agents, managers, housing, FM, councils, and holiday lets. Pre-launch.",
      path: "/industries/",
    });
  }
  const seo = getIndustrySeoIntent(role.slug);
  return contentPageMetadata({
    title: seo?.title ?? role.productName ?? role.label,
    description: seo ? `${seo.summary} Pre-launch, not always-on.` : role.metaDescription,
    path: `/industries/${role.slug}/`,
  });
}
