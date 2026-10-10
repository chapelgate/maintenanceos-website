import type { Metadata } from "next";
import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = contentPageMetadata({
  title: "About MaintenanceOS",
  description:
    "Why MaintenanceOS is built the way it is: fixed safety rules, an authorised person on anything flagged as dangerous, and an AI that never has the final say.",
  path: "/about/",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Chapelgate · United Kingdom"
        title="Why MaintenanceOS is built the way it is"
        lede="We are building operations software so UK property maintenance stays clear, accountable, and in control — a maintenance department as a service mindset for landlords, letting agents, and property managers."
      />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 text-muted">
        <section aria-labelledby="about-why" className="space-y-4">
          <h2 id="about-why" className="text-xl font-semibold text-ink">
            Why we are building it
          </h2>
          <p>
            Chapelgate is developing MaintenanceOS so intake, triage, and
            follow-through stay auditable. Deterministic safety rules and human
            clearance for critical decisions sit above AI assistance — the
            product is designed so AI does not hold final authority on safety
            or money.
          </p>
          <p>
            The commercial problem is familiar to UK ops teams: missed
            maintenance calls, invented promises, and safety mixed with routine
            jobs. The product is designed so a leaky tap stays a structured job
            and 999 stays emergency services.
          </p>
        </section>

        <section aria-labelledby="about-uk" className="space-y-4">
          <h2 id="about-uk" className="text-xl font-semibold text-ink">
            UK-focused by design
          </h2>
          <p>
            The product is shaped for UK property maintenance operations —
            including UK emergency guidance terminology in the receptionist
            design. We describe capabilities carefully while the programme is
            still pre-launch.
          </p>
          <p>
            Eight industry lines sit under Chapelgate on{" "}
            <a
              href="/industries/"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              Industries
            </a>
            . Those pages are positioning for UK verticals — not a claim that
            each line is commercially available today.
          </p>
        </section>

        <section aria-labelledby="about-honesty" className="space-y-4">
          <h2 id="about-honesty" className="text-xl font-semibold text-ink">
            How we show up publicly
          </h2>
          <p>
            This marketing site is pre-launch. We do not invent team bios,
            customer logos, certifications, or fake dashboards. Product evidence
            lives in the internal pilot programme — not as fabricated social
            proof.
          </p>
        </section>

        <div className="space-y-3">
          <p className="text-sm font-medium text-ink">Stay close to launch</p>
          <CtaPair />
        </div>
      </div>
    </>
  );
}
