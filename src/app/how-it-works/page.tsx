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
        className="border-y border-border bg-accent-subtle"
      >
        <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <h2
            id="honesty-heading"
            className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
          >
            Designed so marketing never outruns the product.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Further controlled live testing is still required before we claim a
            public always-on receptionist.
          </p>
          <p className="mt-6 text-sm">
            <a
              href="/features/"
              className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
            >
              See verified capabilities
            </a>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <CtaPair
          primaryHref="/demo/#launch"
          primaryLabel="Join launch list"
          secondaryHref="/demo/"
          secondaryLabel="Request early demo"
        />
      </div>
    </>
  );
}
