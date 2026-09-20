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
  /**
   * Absolute URL of an optional onboarding scan service (POST `{ url }`).
   * Empty = no crawl; `/create` must not invent extracted content.
   * Static export cannot use relative Next.js API routes.
   */
  onboardingScanEndpoint:
    process.env.NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT ?? "",
  /**
   * Build-time gate for the /create calendar panel. Default false.
   * Companion process uses CALENDAR_ADAPTERS_ENABLED (not inlined here).
   */
  calendarAdaptersEnabled: envFlag(
    process.env.NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED,
    false,
  ),
  /**
   * Absolute URL prefix of the calendar companion (`…/v1/calendar`).
   * Empty + public flag on = in-browser mock. Static export cannot use
   * relative Next.js API routes.
   */
  calendarEndpoint: process.env.NEXT_PUBLIC_CALENDAR_ENDPOINT ?? "",
  /**
   * Build-time gate for the /create sandbox test-call panel. Default false.
   * Companion process uses SANDBOX_TEST_CALL_ENABLED (not inlined here).
   */
  sandboxTestCallEnabled: envFlag(
    process.env.NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED,
    false,
  ),
  /**
   * Absolute URL prefix of the sandbox companion (`…/v1/sandbox`).
   * Empty + public flag on = in-browser scripted stub. Static export cannot
   * use relative Next.js API routes.
   */
  sandboxTestCallEndpoint:
    process.env.NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT ?? "",
  /**
   * Build-time gate for /dashboard. Default false.
   * Companion process uses CUSTOMER_DASHBOARD_ENABLED (not inlined here).
   */
  customerDashboardEnabled: envFlag(
    process.env.NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED,
    false,
  ),
  /**
   * Absolute URL prefix of the dashboard companion (`…/v1/dashboard`).
   * Empty + public flag on = in-browser SAMPLE mock. Static export cannot
   * use relative Next.js API routes.
   */
  customerDashboardEndpoint:
    process.env.NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT ?? "",
  locale: "en-GB",
} as const;

export const dashboardNavLabel = siteConfig.customerDashboardEnabled
  ? "Dashboard"
  : "Dashboard (soon)";

/** Conversion forms — always render via LeadCaptureForm. See docs/FORM_ENDPOINT_CONTRACT.md. */
export type LeadType =
  | "launch_list"
  | "early_demo"
  | "contact"
  | "create_receptionist";

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
  { href: "/create/", label: "Create" },
  { href: "/dashboard/", label: dashboardNavLabel },
  { href: "/security/", label: "Security" },
  { href: "/industries/", label: "Industries", children: industries },
  { href: "/pricing/", label: "Pricing" },
] as const;

export const footerNav = {
  product: [
    { href: "/how-it-works/", label: "How it works" },
    { href: "/features/", label: "Features" },
    { href: "/ai-receptionist/", label: "AI receptionist" },
    { href: "/create/", label: "Create receptionist" },
    { href: "/dashboard/", label: dashboardNavLabel },
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
    { href: "/create/", label: "Create from website" },
    { href: "/demo/#launch", label: "Join launch list" },
    { href: "/demo/", label: "Request early demo" },
  ],
} as const;
