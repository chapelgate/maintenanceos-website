/**
 * Site-wide public config. Safe for client bundles (NEXT_PUBLIC_* only).
 * Flip PUBLIC_LAUNCH only after WEBSITE_LAUNCH_CHECKLIST.md is complete.
 */

import { usableHttpEndpoint } from "@/lib/public-enquiry";

function envFlag(value: string | undefined, fallback = false): boolean {
  if (value === undefined || value === "") return fallback;
  return value === "true" || value === "1";
}

/** Retired receiver. It returns 404 Application not found and must not be the fallback. */
export const PRODUCTION_FORM_ENDPOINT =
  "https://rsfm-control-plane-production.up.railway.app/v1/public/website-leads";

export const RETIRED_MEASUREMENT_ENDPOINT =
  "https://rsfm-control-plane-production.up.railway.app/v1/public/website-events";

export const siteConfig = {
  /** Product presented on this site. */
  name: "MaintenanceOS",
  /** Master brand: wordmark, title suffix, and Open Graph site name. One word. */
  publicBrand: "WorkSmartOS",
  /** Same master brand. MaintenanceOS is one product; ReceptionistOS is coming soon and is not live. */
  parentBrand: "WorkSmartOS",
  publisherName: "Chapelgate",
  shortName: "MOS",
  category: "UK maintenance operations software with AI-assisted intake",
  tagline:
    "UK maintenance operations software with AI-assisted intake — rules keep control.",
  description:
    "MaintenanceOS turns incoming repair reports into structured work. Dangerous cases stay with a person. Pre-launch, not a public always-on phone.",
  /** PRE-LAUNCH gate. Default false. */
  publicLaunch: envFlag(process.env.NEXT_PUBLIC_PUBLIC_LAUNCH, false),
  /**
   * Absolute origin for canonical / OG / JSON-LD / sitemap.
   * Empty at build → fallback in `src/lib/site-url.ts`
   * (`https://worksmartos.co.uk`).
   * DNS now resolves to this export.
   */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT ?? "local",
  /**
   * Absolute URL implementing docs/FORM_ENDPOINT_CONTRACT.md.
   * Empty, or the retired Railway host, means the honest mailto fallback.
   * A build-time NEXT_PUBLIC_FORM_ENDPOINT can point at a working receiver.
   */
  formEndpoint: usableHttpEndpoint(process.env.NEXT_PUBLIC_FORM_ENDPOINT),
  /**
   * Privacy-minimised first-party measurement endpoint.
   * Empty, or the retired Railway host, sends nothing (no CORS request).
   */
  measurementEndpoint: usableHttpEndpoint(
    process.env.NEXT_PUBLIC_MEASUREMENT_ENDPOINT,
  ),
  /**
   * Same-origin on-demand website scanner routed to DigitalOcean Functions.
   * There is no always-on scanner container.
   */
  onboardingScanEndpoint: "/api/website/scan",
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
  /**
   * Live demo phone number (E.164 format, e.g. +447700900123).
   * Provided by Andy via NEXT_PUBLIC_DEMO_PHONE_NUMBER.
   * Empty means the live demo number is not yet configured.
   */
  demoPhoneNumber: process.env.NEXT_PUBLIC_DEMO_PHONE_NUMBER ?? "",
} as const;

/** Conversion forms — always render via LeadCaptureForm. See docs/FORM_ENDPOINT_CONTRACT.md. */
export type LeadType =
  | "launch_list"
  | "early_demo"
  | "contact"
  | "create_receptionist";

/** Industry nav — *OS product line names. */
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

export const primaryNav = [
  { href: "/how-it-works/", label: "How it works" },
  { href: "/how-we-keep-control/", label: "Safety rules" },
  { href: "/features/", label: "Features" },
  { href: "/ai-receptionist/", label: "AI receptionist (preview)" },
  { href: "/security/", label: "Security" },
  { href: "/industries/", label: "All sectors", children: industries },
  { href: "/pricing/", label: "Pricing" },
] as const;

export const footerNav = {
  product: [
    { href: "/how-it-works/", label: "How it works" },
    { href: "/how-we-keep-control/", label: "Safety rules" },
    { href: "/features/", label: "Features" },
    { href: "/property-maintenance-software/", label: "Property maintenance software" },
    { href: "/ai-receptionist/", label: "AI receptionist (preview)" },
    { href: "/create/", label: "Try website set-up (preview)" },
    { href: "/security/", label: "Security" },
    { href: "/industries/", label: "All sectors" },
    { href: "/pricing/", label: "Pricing" },
    { href: "/compare/", label: "Compare alternatives" },
  ],
  company: [
    { href: "/about/", label: "About" },
    { href: "/contact/", label: "Contact" },
    { href: "/faq/", label: "FAQ" },
    { href: "/status/", label: "Status" },
    { href: "/accessibility/", label: "Accessibility" },
    { href: "/trust/", label: "Trust & verification" },
  ],
  legal: [
    { href: "/privacy/", label: "Privacy" },
    { href: "/cookies/", label: "Cookies" },
    { href: "/cookies/#settings", label: "Cookie settings" },
    { href: "/terms/", label: "Terms" },
  ],
  convert: [
    { href: "/demo/", label: "Request an early demo" },
    { href: "/create/", label: "Try website set-up (preview)" },
  ],
} as const;
