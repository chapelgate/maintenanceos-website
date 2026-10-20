import { industries } from "@/config/site";
import { getAllComparisonSlugs } from "../lib/compare.ts";
import { getBlogPostSlugs } from "../lib/blog";
import { getHelpArticleSlugs } from "../lib/help";

/**
 * Public marketing routes for the static export sitemap.
 * No admin, account, or API paths exist in this repo.
 */
export const marketingPaths: readonly string[] = [
  "/",
  "/how-it-works/",
  "/features/",
  "/compare/",
  ...getAllComparisonSlugs().map((slug) => `/compare/${slug}/`),
  "/blog/",
  ...getBlogPostSlugs().map((slug) => `/blog/${slug}/`),
  "/help/",
  ...getHelpArticleSlugs().map((slug) => `/help/${slug}/`),
  "/property-maintenance-software/",
  "/ai-receptionist/",
  "/create/",
  "/how-we-keep-control/",
  "/security/",
  "/industries/",
  ...industries.map((industry) => `/industries/${industry.slug}/`),
  "/pricing/",
  "/demo/",
  "/contact/",
  "/about/",
  "/faq/",
  "/privacy/",
  "/cookies/",
  "/terms/",
  "/accessibility/",
  "/vulnerability-disclosure/",
  "/subprocessors/",
];
