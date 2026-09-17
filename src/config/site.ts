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
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT ?? "local",
  formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "",
  locale: "en-GB",
} as const;

export type LeadType = "launch_list" | "early_demo" | "contact";

export const industries = [
  { slug: "landlords", label: "Landlords" },
  { slug: "letting-agents", label: "Letting agents" },
  { slug: "property-managers", label: "Property managers" },
  { slug: "maintenance-companies", label: "Maintenance companies" },
  { slug: "housing-associations", label: "Housing associations" },
  { slug: "facilities-management", label: "Facilities management" },
  { slug: "councils", label: "Councils" },
  { slug: "holiday-lets", label: "Holiday lets" },
] as const;

/** Desktop primary nav (IA v0.2): includes Pricing. */
export const primaryNav = [
  { href: "/how-it-works/", label: "How it works" },
  { href: "/features/", label: "Features" },
  { href: "/ai-receptionist/", label: "AI receptionist" },
  { href: "/security/", label: "Security" },
  { href: "/pricing/", label: "Pricing" },
  { href: "/industries/", label: "Industries", children: industries },
] as const;

export const footerNav = {
  product: [
    { href: "/how-it-works/", label: "How it works" },
    { href: "/features/", label: "Features" },
    { href: "/ai-receptionist/", label: "AI receptionist" },
    { href: "/security/", label: "Security" },
    { href: "/pricing/", label: "Pricing" },
    { href: "/industries/", label: "Industries" },
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
    { href: "/terms/", label: "Terms" },
  ],
  convert: [
    { href: "/demo/#launch", label: "Join launch list" },
    { href: "/demo/", label: "Request early demo" },
  ],
} as const;
