import { CtaPair } from "@/components/CtaPair";
import { HowItWorksFlow } from "@/components/HowItWorksFlow";
import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "How it works",
  description:
    "How MaintenanceOS is designed to work: intake, deterministic triage, human oversight, and accountable execution — pre-launch, claims-gated.",
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="Operations flow"
        title="How MaintenanceOS is designed to work"
        lede="From intake to accountable execution — with deterministic safety rules ahead of AI assistance. Capabilities described here are designed and under testing, not commercially generally available."
      />

      <HowItWorksFlow />

      <section
        aria-labelledby="safety-heading"
        className="border-y border-border bg-accent-subtle/60"
      >
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 id="safety-heading" className="text-2xl font-semibold text-ink">
            Deterministic safety over AI
          </h2>
          <p className="mt-3 text-muted">
            AI may help collect details and draft classifications. Lifecycle
            rules, the critical safety latch, and escalation queues are
            designed to stay in control. The model is not given authority to
            invent bookings, dispatches, refunds, compensation, or safety
            assurances.
          </p>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-muted">
            <li>Safety and lifecycle rules classify and route work.</li>
            <li>Critical paths require human clearance before consequential action.</li>
            <li>Audit evidence stays tied to the work order.</li>
          </ul>
          <p className="mt-6 text-sm text-muted">
            Related:{" "}
            <a href="/features/" className="text-accent underline hover:text-accent-hover">
              Features
            </a>
            {" · "}
            <a
              href="/ai-receptionist/"
              className="text-accent underline hover:text-accent-hover"
            >
              AI receptionist
            </a>
            {" · "}
            <a href="/security/" className="text-accent underline hover:text-accent-hover">
              Security
            </a>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-xl font-semibold text-ink">See it in context</h2>
        <p className="mt-2 text-muted">
          Pre-launch — join the list or request an early demo. No fake live
          dashboards or commercial GA claims.
        </p>
        <CtaPair
          className="mt-6"
          primaryHref="/demo/"
          primaryLabel="Request early demo"
          secondaryHref="/demo/#launch"
          secondaryLabel="Join launch list"
        />
      </div>
    </>
  );
}
