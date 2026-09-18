import type { Metadata } from "next";
import { CtaPair } from "@/components/CtaPair";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";

export const metadata: Metadata = {
  title: {
    absolute: "MaintenanceOS — Property maintenance operations for UK landlords",
  },
  description:
    "Multi-tenant platform for UK landlords, letting agents, and property managers. AI intake under testing; deterministic rules own safety and money. Pre-launch — join the launch list.",
};

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
      <section className="border-b border-border bg-surface px-4 py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-accent">
              Pre-launch · United Kingdom
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Maintenance calls, structured — without the model running your
              operation.
            </h1>
            <p className="mt-5 text-lg text-ink">
              MaintenanceOS is a multi-tenant platform for UK landlords, letting
              agents, and property managers. An AI receptionist layer is designed
              to collect and classify what callers say (under testing);
              deterministic rules own safety, approvals, and money prohibitions.
            </p>
            <CtaPair className="mt-8" primaryHref="/#join" />
            <p className="mt-4 text-sm">
              <a
                href="/how-it-works/"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                See how intake works
              </a>
            </p>
            <p className="mt-4 text-sm text-muted">
              Pilot-stage. Core controls are real; public always-on phone is not
              declared ready yet.
            </p>
          </div>

          <div
            className="rounded-xl border border-border bg-paper p-6 shadow-sm"
            aria-hidden="true"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-sm font-semibold text-ink">Work orders</span>
              <span className="rounded-md bg-accent-subtle px-2 py-0.5 text-xs font-medium text-accent">
                Structure only
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Intake", note: "Caller details classified" },
                { label: "Safety latch", note: "Awaiting human clearance" },
                { label: "Escalation", note: "Queue — rules decide next" },
              ].map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-ink">{row.label}</span>
                  <span className="text-xs text-muted">{row.note}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">
              Placeholder ops chrome — not live metrics.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-xl border border-border bg-surface p-6 sm:p-8"
            >
              <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                {pillar.title}
              </h2>
              <p className="mt-3 text-base text-ink">{pillar.body}</p>
              <p className="mt-5 text-sm">
                <a
                  href={pillar.href}
                  className="font-medium text-accent underline-offset-2 hover:underline"
                >
                  {pillar.link}
                </a>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-paper px-4 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-accent">
            What we will not claim
          </p>
          <p className="mt-3 text-base text-ink">
            No fabricated customers or logos. No certifications we do not hold.
            No “handles N concurrent lines” marketing numbers. No public live
            receptionist claim until that gate is cleared.
          </p>
        </div>
      </section>

      <section className="bg-surface px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Want an early look?
          </h2>
          <p className="mt-3 text-base text-ink">
            We’ll brief you on what’s verified today and what’s still under
            test.
          </p>
          <CtaPair className="mt-8 justify-center" />
        </div>
      </section>

      <section id="join" className="border-t border-border bg-paper px-4 py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-semibold text-ink">Join the launch list</h2>
          <p className="mt-2 text-muted">
            Email and role only. Pre-launch updates — no spam, no live phone
            line.
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
