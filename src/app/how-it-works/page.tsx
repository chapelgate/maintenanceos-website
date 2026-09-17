import { CtaPair } from "@/components/CtaPair";
import { HowItWorksFlow } from "@/components/HowItWorksFlow";
import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "How MaintenanceOS is designed to work — From caller to structured work",
  description:
    "Intake, controlled triage, and human oversight. Deterministic rules own safety and money; AI helps structure the paperwork. Pre-launch.",
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="Pre-launch. Not a public live service yet."
        title="From caller to structured work — with humans and rules in the loop."
        lede="Three stages property teams can trust: intake, controlled triage, and human oversight. The AI never overrides safety or money rules."
      />

      <HowItWorksFlow />

      <section
        aria-labelledby="honesty-heading"
        className="border-y border-border bg-accent-subtle/60"
      >
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 id="honesty-heading" className="text-2xl font-semibold text-ink">
            Designed so marketing never outruns the product.
          </h2>
          <p className="mt-3 text-muted">
            Offline safety evaluation supports QA. A fresh controlled live call
            on the current stack is still required before any production
            always-on receptionist claim.
          </p>
          <p className="mt-6 text-sm text-muted">
            See{" "}
            <a
              href="/features/"
              className="text-accent underline hover:text-accent-hover"
            >
              verified capabilities
            </a>
            {" · "}
            <a
              href="/ai-receptionist/"
              className="text-accent underline hover:text-accent-hover"
            >
              AI receptionist
            </a>
            {" · "}
            <a
              href="/security/"
              className="text-accent underline hover:text-accent-hover"
            >
              Security
            </a>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12">
        <CtaPair
          className="mt-2"
          primaryHref="/demo/#launch"
          primaryLabel="Join launch list"
          secondaryHref="/demo/"
          secondaryLabel="Request early demo"
        />
      </div>
    </>
  );
}
