import type { Metadata } from "next";
import { CtaPair } from "@/components/CtaPair";
import { CommercialProof } from "@/components/CommercialProof";
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
              Pre-launch · Under test · UK
            </p>
            <h1
              id="hero-heading"
              className="mt-5 text-3xl font-semibold tracking-tight text-ink [text-wrap:balance] sm:text-4xl sm:leading-[1.12] lg:text-[2.75rem] lg:leading-[1.12]"
            >
              Turn maintenance requests into clear, controlled work.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
              MaintenanceOS by Chapelgate helps UK landlords, letting agents,
              property managers, and maintenance teams capture maintenance
              requests, structure the work, escalate critical cases, and keep
              approvals with authorised people.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              AI assists intake. Server rules own safety, lifecycle, and
              approvals. The AI receptionist capability is under testing; this
              is not a public always-on phone service.
            </p>
            <CtaPair
              className="mt-8"
              primaryHref="/create/"
              primaryLabel="Create from website"
              secondaryHref="/demo/#see-it-work"
              secondaryLabel="See it work"
            />
            <p className="mt-4 text-sm text-muted">
              Funnel: Website → Review pack → Early access.
            </p>
            <ProductTourWatchLink className="mt-3" />
            <HomeLifestyleStrip />
            <HomeRoleChips />
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Pilot-stage. Core controls are real; public always-on phone is not
              declared ready yet.{" "}
              <a
                href="/how-it-works/"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                See how it works
              </a>
            </p>
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
            Supervisor shell · under test
          </h2>
          <ProductUiShell />
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
                Join the list or start from your website
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Early access is opening carefully. The public path is website URL
                → scan/draft → knowledge pack → optional scripted sandbox → early
                access. No live phone demo from this site.{" "}
                <a
                  href="/create/"
                  className="font-medium text-accent underline-offset-4 hover:underline"
                >
                  Create from website
                </a>
              </p>
            </div>
          </div>
          <CtaPair
            primaryHref="/create/"
            primaryLabel="Create from website"
            secondaryHref="/demo/#demo"
            secondaryLabel="Request early access"
          />
        </div>
      </section>

      {/* 5. #join capture */}
      <section id="join" className="border-t border-border bg-paper px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-semibold text-ink">Join launch list</h2>
          <p className="mt-2 text-muted">
            Be notified when early access opens. No fake urgency — we are still
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
