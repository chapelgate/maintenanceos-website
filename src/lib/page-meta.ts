import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { absoluteUrl, getCanonicalSiteUrl } from "@/lib/site-url";

const defaultTitle = `${siteConfig.name} — Property maintenance operations`;

function ogLocale(): string {
  return siteConfig.locale.replace("-", "_");
}

/** Root metadata for the static marketing export. Indexable; copy stays pre-launch. */
export function buildRootMetadata(): Metadata {
  const origin = getCanonicalSiteUrl();
  const home = `${origin}/`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: defaultTitle,
      template: `%s · ${siteConfig.name}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.name,
    robots: { index: true, follow: true },
    alternates: { canonical: home },
    openGraph: {
      type: "website",
      locale: ogLocale(),
      url: home,
      siteName: siteConfig.name,
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
}): Metadata {
  const path = opts.path.endsWith("/") ? opts.path : `${opts.path}/`;
  const canonical = absoluteUrl(path);
  const ogTitle = `${opts.title} · ${siteConfig.name}`;

  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: opts.description,
      url: canonical,
      siteName: siteConfig.name,
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
