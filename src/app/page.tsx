import type { Metadata } from "next";
import { CtaPair } from "@/components/CtaPair";
import { HonestyBanner } from "@/components/HonestyBanner";
import { HomeOnboardingSteps } from "@/components/HomeOnboardingSteps";
import { HomeRoleChips } from "@/components/HomeRoleChips";
import { HomeTrustStrip } from "@/components/HomeTrustStrip";
import { JsonLd } from "@/components/JsonLd";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { ObjectionFaq } from "@/components/ObjectionFaq";
import { ProductTourWatchLink } from "@/components/ProductTour";
import { SiriOrbCloud } from "@/components/SiriOrbCloud";
import { UkScenarioVignettes } from "@/components/UkScenarioVignettes";
import { funnelPageJsonLd } from "@/lib/json-ld";
import { funnelPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = funnelPageMetadata("home");

const pillars = [
  {
    title: "AI for intake. Rules for the operation.",
    body: "The receptionist is designed to gather caller details and classify the issue (capability under testing). Lifecycle, safety latching, escalations, and approvals stay on deterministic server controls. The AI does not override safety or perform consequential actions on its own.",
    href: "/how-it-works/",
    link: "See how it works",
  },
  {
    title: "Built for UK property maintenance.",
    body: "Multi-tenant properties, residents, contractors, work orders, jobs, communications, and call sessions — not a generic chatbot. Capabilities are present in product source and under testing for release. The receptionist capability is built for UK terminology — under testing, including 999 emergency guidance where relevant. It is designed to collect caller details.",
    href: "/features/",
    link: "Features",
  },
  {
    title: "Money and safety stay out of the model’s hands.",
    body: "No payment, refund, compensation, fee-waiver, or client-money execution authority. Emergency detection and human clearance are rule-driven. Critical safety paths are designed to latch until a person clears them.",
    href: "/security/",
    link: "Security",
  },
  {
    title: "Human when it matters.",
    body: "Callers can request a live transfer (explicit request). The system is designed not to invent bookings, dispatches, refunds, compensation, account information, or safety assurances. Voice intake remains under testing for release — not offered as a public always-on service. Prior validation calls have been used in testing; further controlled testing is underway.",
    href: "/ai-receptionist/",
    link: "AI receptionist",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <JsonLd data={funnelPageJsonLd("home")} />
      {/* 1. Hero — light paper; locked CTAs stay primary; orb is secondary */}
      <section className="border-b border-border bg-surface px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center rounded-md bg-accent-subtle px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
              Pre-launch · United Kingdom
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink sm:text-5xl sm:leading-[1.12]">
              UK maintenance operations. AI intake. Rules keep control.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink">
              MaintenanceOS is a multi-tenant platform for UK landlords, letting
              agents, and property managers. An AI receptionist layer is designed
              to collect and classify what callers say (under testing);
              deterministic rules own safety, approvals, and money prohibitions.
            </p>
            <CtaPair
              className="mt-8"
              primaryHref="/create/"
              primaryLabel="Create from website"
              secondaryHref="/demo/#demo"
              secondaryLabel="Request early access"
            />
            <ProductTourWatchLink className="mt-3" />
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

          <SiriOrbCloud />
        </div>
      </section>

      <HomeTrustStrip />

      <HomeOnboardingSteps />

      {/* 2. Value pillars */}
      <section
        aria-labelledby="home-why-heading"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
      >
        <h2
          id="home-why-heading"
          className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
        >
          Why MaintenanceOS
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          UK maintenance ops first. AI assists at intake. Rules and people own
          safety and money. Still pre-launch — not a live always-on phone.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="mos-glass p-6 sm:p-8"
            >
              <h3 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                {pillar.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-ink">{pillar.body}</p>
              <p className="mt-5 text-sm">
                <a
                  href={pillar.href}
                  className="font-semibold text-accent underline-offset-4 hover:underline"
                >
                  {pillar.link}
                </a>
              </p>
            </article>
          ))}
        </div>
      </section>

      <UkScenarioVignettes />

      <HonestyBanner />

      <ObjectionFaq />

      {/* 4. Closing CTA band — after the objection set, not per question */}
      <section className="bg-surface px-4 py-14 sm:px-6">
        <div className="mos-glass mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
          <div className="max-w-lg">
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
