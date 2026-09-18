import { faqItems } from "@/content/faqs";
import { absoluteUrl, getCanonicalSiteUrl } from "@/lib/site-url";
import { siteConfig } from "@/config/site";

export type JsonLdRecord = Record<string, unknown>;

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
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    inLanguage: siteConfig.locale,
  };
}

function websiteNode(): JsonLdRecord {
  return {
    "@type": "WebSite",
    "@id": websiteId(),
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    inLanguage: siteConfig.locale,
    publisher: { "@id": orgId() },
  };
}

/**
 * SoftwareApplication for a pre-launch product.
 * Availability is PreOrder; no ratings, reviews, or in-stock offers.
 */
function softwareApplicationNode(): JsonLdRecord {
  return {
    "@type": "SoftwareApplication",
    "@id": softwareId(),
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/"),
    description:
      "Pre-launch operations software for UK property maintenance. AI receptionist intake is under testing. Deterministic rules and human clearance own safety and money. Not commercially generally available; not a public always-on phone service.",
    inLanguage: siteConfig.locale,
    countriesSupported: "GB",
    publisher: { "@id": orgId() },
    offers: {
      "@type": "Offer",
      url: absoluteUrl("/pricing/"),
      availability: "https://schema.org/PreOrder",
      category: "Pre-launch early access",
    },
  };
}

/** Organization + WebSite + pre-launch SoftwareApplication graph for the root layout. */
export function marketingJsonLd(): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(), websiteNode(), softwareApplicationNode()],
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
