import type { Metadata } from "next";
import { CtaPair } from "@/components/CtaPair";
import { CommercialProof } from "@/components/CommercialProof";
import { CustomerAgentOffers } from "@/components/CustomerAgentOffers";
import { HonestyBanner } from "@/components/HonestyBanner";
import { HomeHeroVisual } from "@/components/HomeHeroVisual";
import { HomeIndustries } from "@/components/HomeIndustries";
import { IntakeOrbAccent } from "@/components/IntakeOrbAccent";
import { HomeLifeBand } from "@/components/HomeLifeBand";
import { HomeLifestyleStrip } from "@/components/HomeLifestyleStrip";
import { HomeOnboardingSteps } from "@/components/HomeOnboardingSteps";
import { HomeRoleChips } from "@/components/HomeRoleChips";
import { HomeTrustStrip } from "@/components/HomeTrustStrip";
import { ProductUiShell } from "@/components/ProductUiShell";
import { JsonLd } from "@/components/JsonLd";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { ObjectionFaq } from "@/components/ObjectionFaq";
import { ProductTourWatchLink } from "@/components/ProductTour";
import { SafeAutomationModel } from "@/components/SafeAutomationModel";
import { UkScenarioVignettes } from "@/components/UkScenarioVignettes";
import { funnelPageJsonLd } from "@/lib/json-ld";
import { funnelPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = funnelPageMetadata("home");

const benefits = [
  {
    title: "Capture the request clearly",
    body: "Collect caller details and maintenance context into structured operational records instead of relying on scattered notes.",
  },
  {
    title: "Surface critical cases",
    body: "Critical-safety latching and escalation queues keep RED cases on a controlled path to authorised human review.",
  },
  {
    title: "Keep decisions with your team",
    body: "AI does not override safety, lifecycle, or approval rules. Authorised people retain clearance of critical paths.",
  },
  {
    title: "Keep work traceable",
    body: "Work orders, communications, action evidence, and call-session records create a reviewable operational history.",
  },
] as const;


export default function HomePage() {
  return (
    <>
      <JsonLd data={funnelPageJsonLd("home")} />
      {/* 1. Hero — warm photographic stage + labelled UNDER TEST shell */}
      <section
        className="mos-hero-atmosphere border-b border-border px-4 py-12 sm:px-6 sm:py-16 lg:py-20"
        aria-labelledby="hero-heading"
      >
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="inline-flex items-center rounded-full bg-accent-subtle px-3 py-1 text-xs font-semibold text-accent">
              Pre-launch · in testing
            </p>
            <h1
              id="hero-heading"
              className="mt-5 text-3xl font-semibold tracking-tight text-ink [text-wrap:balance] sm:text-4xl sm:leading-[1.12] lg:text-[2.75rem] lg:leading-[1.12]"
            >
              AI for repair reports. A person still clears anything flagged as dangerous.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
              MaintenanceOS is repair intake for landlords, letting agents and housing providers.
            </p>
            <CtaPair
              className="mt-8"
              primaryHref="/demo/"
              primaryLabel="Request an early demo"
              secondaryHref="/how-we-keep-control/"
              secondaryLabel="See the safety rules →"
            />
          </div>

          <div className="lg:col-span-7" id="product">
            <HomeHeroVisual />
          </div>
        </div>
      </section>

      <section
        className="border-b border-border bg-paper px-4 py-8 sm:px-6"
        aria-labelledby="hero-shell-heading"
      >
        <div className="mx-auto max-w-6xl">
          <h2
            id="hero-shell-heading"
            className="sr-only"
          >
            Supervisor shell · preview
          </h2>
          <ProductUiShell />
          <ProductTourWatchLink className="mt-4" />
          <HomeLifestyleStrip />
          <HomeRoleChips />
        </div>
      </section>

      <section
        aria-labelledby="home-rulebook-heading"
        className="border-b border-border bg-surface px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="home-rulebook-heading"
            className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
          >
            Repairs reporting, with the safety rules written down.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            Fixed safety rules sit above the AI. If a report is flagged as dangerous, it stays with a person until someone authorised clears it. The assistant is built not to invent a booking, a dispatch or a promise that someone is on the way.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            See what happens to a report flagged as dangerous, why only an authorised person can clear it, and what our AI is built never to promise a tenant. MaintenanceOS keeps reports flagged as dangerous with a person and leaves an audit trail on the job.
          </p>
          <p className="mt-5">
            <a
              href="/how-we-keep-control/"
              className="text-sm font-semibold text-accent underline decoration-border underline-offset-4 hover:decoration-accent"
            >
              Read the safety rules →
            </a>
          </p>
        </div>
      </section>

      <HomeTrustStrip />

      <section
        aria-labelledby="home-benefits-heading"
        className="border-b border-border bg-paper px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-accent">What your team gets</p>
            <h2
              id="home-benefits-heading"
              className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
            >
              A clearer route from request to controlled follow-up.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              The customer outcome comes first. The technical controls sit
              underneath it as proof, not as the sales pitch.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5"
              >
                <h3 className="text-base font-semibold text-ink">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {benefit.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CustomerAgentOffers />

      <CommercialProof />

      <HomeLifeBand />

      <HomeOnboardingSteps />

      <SafeAutomationModel compact />

      <HomeIndustries />

      <UkScenarioVignettes />

      <HonestyBanner />

      <ObjectionFaq />

      {/* 4. Closing CTA band — after the objection set, not per question */}
      <section className="home-close-band px-4 py-14 sm:px-6">
        <div className="mos-glass mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
          <div className="section-band-head max-w-lg">
            <IntakeOrbAccent />
            <div>
              <h2 className="text-xl font-semibold text-ink sm:text-2xl">
                See the rules working on a sample repair.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Early access is opening carefully. No live phone demo from this site.
              </p>
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

      {/* 5. #join capture — secondary path for launch updates */}
      <section id="join" className="border-t border-border bg-paper px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-semibold text-ink">Not ready for a demo? Get launch updates</h2>
          <p className="mt-2 text-muted">
            We&apos;ll email you when early access opens. No fake urgency — we are still
            pre-launch.
          </p>
          <div className="mt-6">
            {/* launch_list via LeadCaptureForm (same adapter as /demo and /contact). */}
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
