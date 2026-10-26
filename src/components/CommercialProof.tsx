import { FeatureStatusChip } from "@/components/FeatureStatusChip";
import { phoneAiMarketingCards } from "@/config/phone-ai-features";

const verifiedCapabilities = phoneAiMarketingCards.filter(
  (card) => card.status === "VERIFIED",
);

const trustLinks = [
  { href: "/security/", label: "Security controls" },
  { href: "/privacy/", label: "Privacy notice (draft)" },
  { href: "/how-it-works/", label: "Human review path" },
] as const;

export function CommercialProof() {
  return (
    <section
      id="whats-live-today"
      aria-labelledby="whats-live-today-heading"
      className="border-y border-border bg-surface px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="whats-live-today-heading"
          className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
        >
          {"Preview capability inventory"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Pre-launch preview — not commercial general availability. No invented uptime, testimonials, customer logos, awards, or certification badges. No ISO, SOC 2, or bank-grade claims
          we have not earned. Not a public always-on phone service.
        </p>
        <ul className="mt-6 space-y-3">
          {verifiedCapabilities.map((card) => (
            <li key={card.id} className="flex items-start justify-between gap-3">
              <span className="text-sm text-ink">{card.title}</span>
              <FeatureStatusChip status="VERIFIED" />
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          Critical safety is designed to latch for authorised human review, and the AI has no client-money execution authority. Customer proof will appear here only with a named evidence source, a dated outcome, and permission to publish.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {trustLinks.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="inline-flex rounded-md border border-border bg-paper px-3 py-2 text-sm font-medium text-ink hover:border-accent hover:text-accent"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/features/"
              className="inline-flex rounded-md border border-border bg-paper px-3 py-2 text-sm font-medium text-ink hover:border-accent hover:text-accent"
            >
              Capability evidence
            </a>
          </li>
          <li>
            <a
              href="/how-it-works/#scenarios"
              className="inline-flex rounded-md border border-border bg-paper px-3 py-2 text-sm font-medium text-ink hover:border-accent hover:text-accent"
            >
              Labelled scenarios
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
