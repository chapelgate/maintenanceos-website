import { industries } from "@/config/site";

/**
 * Public marketing routes for the static export sitemap.
 * No admin, account, or API paths exist in this repo.
 */
export const marketingPaths: readonly string[] = [
  "/",
  "/how-it-works/",
  "/features/",
  "/property-maintenance-software/",
  "/ai-receptionist/",
  "/create/",
  "/how-we-keep-control/",
  "/dashboard/",
  "/security/",
  "/industries/",
  ...industries.map((industry) => `/industries/${industry.slug}/`),
  "/pricing/",
  "/demo/",
  "/contact/",
  "/about/",
  "/faq/",
  "/status/",
  "/privacy/",
  "/cookies/",
  "/terms/",
];
