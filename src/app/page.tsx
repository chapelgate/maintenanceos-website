import type { Metadata } from "next";
import { CtaPair } from "@/components/CtaPair";
import { JsonLd } from "@/components/JsonLd";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { SiriOrbCloud } from "@/components/SiriOrbCloud";
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

const honestyItems = [
  "No fabricated customers, logos, or awards",
  "No ISO, SOC 2, or bank-grade claims we have not earned",
  "No “handles N concurrent lines” marketing numbers",
  "No public live receptionist claim until that gate is cleared",
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
              Maintenance calls, structured — without the model running your
              operation.
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

      {/* 2. Value pillars */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="mos-glass p-6 sm:p-8"
            >
              <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                {pillar.title}
              </h2>
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

      {/* 3. Honesty — what we will not claim */}
      <section className="border-y border-border bg-paper px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-accent">
            What we will not claim
          </p>
          <ul className="mx-auto mt-6 max-w-xl space-y-3">
            {honestyItems.map((item) => (
              <li key={item} className="flex gap-3 text-base leading-relaxed text-ink">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. Closing CTA band */}
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
