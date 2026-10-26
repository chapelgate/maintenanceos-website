import type { Metadata } from "next";
import { CtaPair } from "@/components/CtaPair";
import { HomeIndustries } from "@/components/HomeIndustries";
import { HomeOnboardingSteps } from "@/components/HomeOnboardingSteps";
import { HomeRoleChips } from "@/components/HomeRoleChips";
import { HomeTrustStrip } from "@/components/HomeTrustStrip";
import { ProductLine } from "@/components/ProductLine";
import { ProductUiShell } from "@/components/ProductUiShell";
import { JsonLd } from "@/components/JsonLd";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { ProductTourWatchLink } from "@/components/ProductTour";
import { SafeAutomationLink } from "@/components/SafeAutomationLink";
import { fullFunnelPageJsonLd } from "@/lib/json-ld";
import { funnelPageMetadata } from "@/lib/page-meta";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = funnelPageMetadata("home");

const benefits = [
  {
    title: "Capture Caller Details",
    body: "Structured work orders from messy telephone calls.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
  },
  {
    title: "Surface Critical Hazards",
    body: "Automatic detection of gas, electrical danger, and leaks.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    title: "Fixed Rule Engine",
    body: "The AI never commits your budget or promises false arrival times.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    title: "Immutable Audit Trail",
    body: "Complete evidence log for compliance and the Housing Ombudsman.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
] as const;

export default function HomePage() {
  return (
    <>
      <JsonLd data={fullFunnelPageJsonLd("home")} />
      {/* 1. Hero */}
      <section
        className="mos-hero-atmosphere border-b border-border px-4 py-12 sm:px-6 sm:py-16 lg:py-20"
        aria-labelledby="hero-heading"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="badge dev mb-4">
              Pre-launch
            </p>
            <h1
              id="hero-heading"
              className="text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] leading-[1.15]"
            >
              WorkSmartOS
            </h1>
            <p className="mt-3 text-lg font-semibold text-ink">
              WorkSmartOS MaintenanceOS
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg max-w-2xl">
              MaintenanceOS is the property-maintenance product. AI intake for repair reports. A person still clears anything dangerous.
            </p>
            <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg max-w-2xl">
              Designed to capture caller details in natural UK terminology when voice intake is enabled — not a live always-on phone. Fixed server rules latch critical repairs for authorised human clearance.
            </p>
            <CtaPair
              className="mt-8"
              primaryHref="/demo/"
              primaryLabel="Request an early demo"
              secondaryHref="/how-we-keep-control/"
              secondaryLabel="See safety rules →"
            />
            <p className="mt-3 text-sm text-muted">
              Early demo request is an interest note — not a booking, checkout, or sale.
            </p>
            <p className="mt-4 text-xs text-muted">
              <a href="/how-we-keep-control/#gas" className="text-accent underline underline-offset-2">
                Smell gas? What to do right now →
              </a>
            </p>
          </div>

          <div className="mt-12" id="product">
            <h2 id="hero-shell-heading" className="sr-only">
              Supervisor shell preview
            </h2>
            <ProductUiShell />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <ProductTourWatchLink />
              <HomeRoleChips />
            </div>
          </div>
        </div>
      </section>

      <ProductLine />

      {/* Authoritative Governance & Trust Strip */}
      <HomeTrustStrip />

      {/* 2. Benefits Bento (4 Cards) */}
      <section
        aria-labelledby="home-benefits-heading"
        className="border-b border-border bg-paper py-12 px-4 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">What your team gets</p>
            <h2
              id="home-benefits-heading"
              className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl"
            >
              From the request to the record.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="mos-bento-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                      {benefit.icon}
                    </div>
                    <h3 className="text-base font-semibold text-ink">{benefit.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">
                    {benefit.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Onboarding Section: Single clean horizontal pipeline bar */}
      <HomeOnboardingSteps />

      {/* 4. Safety Architecture Link */}
      <SafeAutomationLink />

      {/* 5. Sector Links: 8 compact clickable sector pills */}
      <HomeIndustries />

      <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted sm:px-6">
        <a
          href="/how-it-works/#objections"
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          Straight answers before you start →
        </a>
      </p>

      {/* 6. Closing CTA band */}
      <section className="border-t border-border bg-surface px-4 py-12 sm:px-6">
        <div className="band mx-auto max-w-6xl flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="section-band-head max-w-lg">
            <div>
              <h2 className="text-xl font-bold text-ink sm:text-2xl">
                See the rules working on a sample repair.
              </h2>
              {siteConfig.demoPhoneNumber ? (
                <p className="mt-2 text-sm text-muted">
                  Preview demo number (not production):{" "}
                  <a
                    href={`tel:${siteConfig.demoPhoneNumber}`}
                    className="font-medium text-accent underline-offset-2 hover:underline"
                  >
                    {siteConfig.demoPhoneNumber}
                  </a>
                  {" — when enabled, AI greeting and basic intake preview. Not a production service and not a live always-on phone."}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted">
                  No live phone demo from this site.
                </p>
              )}
            </div>
          </div>
          <CtaPair
            primaryHref="/demo/"
            primaryLabel="Request an early demo"
            secondaryHref="/demo/#see-it-work"
            secondaryLabel="See it work"
          />
        </div>
      </section>

      {/* 7. Launch updates */}
      <section id="join" className="border-t border-border bg-paper px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-xl">
          <h2 className="text-xl font-semibold text-ink">Not ready for a demo? Get launch updates</h2>
          <p className="mt-2 text-xs text-muted">
            We will email when early access opens. Pre-launch.
          </p>
          <div className="mt-5">
            <LeadCaptureForm
              leadType="launch_list"
              submitLabel="Join launch list"
              showOrganisation={false}
            />
          </div>
        </div>
      </section>
    </>
  );
}
