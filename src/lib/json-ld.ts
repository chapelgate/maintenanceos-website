import { faqItems } from "@/content/faqs";
import { siteConfig } from "@/config/site";
import { funnelPageCopy } from "@/lib/page-meta";
import { absoluteUrl, getCanonicalSiteUrl } from "@/lib/site-url";

export type JsonLdRecord = Record<string, unknown>;

export type FunnelJsonLdPage = keyof typeof funnelPageCopy;

function orgId(): string {
  return `${getCanonicalSiteUrl()}/#organization`;
}

function websiteId(): string {
  return `${getCanonicalSiteUrl()}/#website`;
}

function softwareId(): string {
  return `${getCanonicalSiteUrl()}/#software`;
}

function organizationNode(): JsonLdRecord {
  return {
    "@type": "Organization",
    "@id": orgId(),
    name: siteConfig.publisherName,
    url: absoluteUrl("/"),
    description: `Publisher of ${siteConfig.name}, ${siteConfig.category}.`,
    brand: {
      "@type": "Brand",
      name: siteConfig.publicBrand,
    },
    inLanguage: siteConfig.locale,
  };
}

function websiteNode(): JsonLdRecord {
  return {
    "@type": "WebSite",
    "@id": websiteId(),
    name: siteConfig.publicBrand,
    alternateName: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    inLanguage: siteConfig.locale,
    publisher: { "@id": orgId() },
    brand: {
      "@type": "Brand",
      name: siteConfig.publicBrand,
    },
  };
}

/**
 * SoftwareApplication for a pre-launch product.
 * Accurate as product identity only: no telephone, ratings, reviews, or offers.
 */
function softwareApplicationNode(): JsonLdRecord {
  return {
    "@type": "SoftwareApplication",
    "@id": softwareId(),
    name: siteConfig.name,
    alternateName: siteConfig.publicBrand,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Property maintenance operations software",
    operatingSystem: "Web",
    url: absoluteUrl("/"),
    description:
      "Pre-launch UK maintenance operations software with AI-assisted intake. The AI receptionist capability is under testing. Deterministic rules and authorised human clearance keep control of safety and money. Not commercially generally available; not a public always-on phone service.",
    inLanguage: siteConfig.locale,
    countriesSupported: "GB",
    publisher: { "@id": orgId() },
  };
}

function webPageNode(page: FunnelJsonLdPage): JsonLdRecord {
  const copy = funnelPageCopy[page];
  const url = absoluteUrl(copy.path);
  const name =
    "absoluteTitle" in copy && copy.absoluteTitle
      ? copy.absoluteTitle
      : copy.title;

  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description: copy.description,
    inLanguage: siteConfig.locale,
    isPartOf: { "@id": websiteId() },
    about: { "@id": softwareId() },
    publisher: { "@id": orgId() },
  };
}

/** Organization + WebSite graph for the root layout (every exported page). */
export function marketingJsonLd(): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(), websiteNode()],
  };
}

/**
 * Claims-safe graph for home and key funnel pages.
 * Organization + WebSite + WebPage, plus SoftwareApplication (no offers).
 * Copy comes from funnelPageCopy so titles stay aligned with SEO meta.
 */
export function funnelPageJsonLd(page: FunnelJsonLdPage): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      websiteNode(),
      webPageNode(page),
      softwareApplicationNode(),
    ],
  };
}

/** FAQPage JSON-LD for /faq/ only — questions already published on the site. */
export function faqPageJsonLd(): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl("/faq/")}#faq`,
    url: absoluteUrl("/faq/"),
    name: "MaintenanceOS frequently asked questions",
    isPartOf: { "@id": websiteId() },
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
