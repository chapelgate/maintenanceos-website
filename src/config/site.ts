/**
 * Site-wide public config. Safe for client bundles (NEXT_PUBLIC_* only).
 * Flip PUBLIC_LAUNCH only after WEBSITE_LAUNCH_CHECKLIST.md is complete.
 */

function envFlag(value: string | undefined, fallback = false): boolean {
  if (value === undefined || value === "") return fallback;
  return value === "true" || value === "1";
}

export const siteConfig = {
  name: "MaintenanceOS",
  shortName: "MOS",
  tagline:
    "Operations software for property maintenance — clear, accountable, in control.",
  description:
    "Maintenance department as a service for UK landlords, letting agents, and property managers. Deterministic safety rules and human clearance; AI assists without final authority on safety or money.",
  /** PRE-LAUNCH gate. Default false. */
  publicLaunch: envFlag(process.env.NEXT_PUBLIC_PUBLIC_LAUNCH, false),
  /**
   * Absolute origin for canonical / OG / JSON-LD / sitemap.
   * Empty at build → fallback in `src/lib/site-url.ts`
   * (`https://seahorse-app-4oasq.ondigitalocean.app`).
   */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT ?? "local",
  /** Absolute URL implementing docs/FORM_ENDPOINT_CONTRACT.md. Empty = local stub. */
  formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "",
  locale: "en-GB",
} as const;

/** Conversion forms — always render via LeadCaptureForm. See docs/FORM_ENDPOINT_CONTRACT.md. */
export type LeadType = "launch_list" | "early_demo" | "contact";

/** Industry nav — *OS product line names. */
export const industries = [
  { slug: "landlords", label: "LandlordOS" },
  { slug: "letting-agents", label: "LettingAgentOS" },
  { slug: "property-managers", label: "PropertyManagerOS" },
  { slug: "maintenance-companies", label: "MaintenanceOS" },
  { slug: "housing-associations", label: "HousingAssociationOS" },
  { slug: "facilities-management", label: "FacilitiesOS" },
  { slug: "councils", label: "CouncilOS" },
  { slug: "holiday-lets", label: "HolidayLetOS" },
] as const;

export const primaryNav = [
  { href: "/how-it-works/", label: "How it works" },
  { href: "/features/", label: "Features" },
  { href: "/ai-receptionist/", label: "AI receptionist" },
  { href: "/security/", label: "Security" },
  { href: "/industries/", label: "Industries", children: industries },
  { href: "/pricing/", label: "Pricing" },
] as const;

export const footerNav = {
  product: [
    { href: "/how-it-works/", label: "How it works" },
    { href: "/features/", label: "Features" },
    { href: "/ai-receptionist/", label: "AI receptionist" },
    { href: "/security/", label: "Security" },
    { href: "/industries/", label: "Industries" },
    { href: "/pricing/", label: "Pricing" },
  ],
  company: [
    { href: "/about/", label: "About" },
    { href: "/contact/", label: "Contact" },
    { href: "/faq/", label: "FAQ" },
    { href: "/status/", label: "Status" },
  ],
  legal: [
    { href: "/privacy/", label: "Privacy" },
    { href: "/cookies/", label: "Cookies" },
    { href: "/cookies/#settings", label: "Cookie settings" },
    { href: "/terms/", label: "Terms" },
  ],
  convert: [
    { href: "/demo/#launch", label: "Join launch list" },
    { href: "/demo/", label: "Request early demo" },
  ],
} as const;
