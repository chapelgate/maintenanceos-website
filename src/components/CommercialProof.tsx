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
      id="proof"
      aria-labelledby="commercial-proof-heading"
      className="border-y border-border bg-surface px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-accent">Evidence, not endorsements</p>
        <h2
          id="commercial-proof-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
        >
          Proof we can show today.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          Pre-launch means we separate source-backed evidence from production
          promises. No invented uptime, testimonials, customer logos, awards, or
          certification badges.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <article className="rounded-[var(--mos-radius-lg)] border border-border bg-paper p-5">
            <h3 className="text-lg font-semibold text-ink">Verified capabilities</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              These items come from the existing signed product-claims register,
              not marketing inference.
            </p>
            <ul className="mt-4 space-y-3">
              {verifiedCapabilities.map((card) => (
                <li key={card.id} className="flex items-start justify-between gap-3">
                  <span className="text-sm text-ink">{card.title}</span>
                  <FeatureStatusChip status="VERIFIED" />
                </li>
              ))}
            </ul>
            <a
              href="/features/"
              className="mt-5 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline"
            >
              See capability evidence
            </a>
          </article>

          <article className="rounded-[var(--mos-radius-lg)] border border-border bg-paper p-5">
            <h3 className="text-lg font-semibold text-ink">Acceptance evidence</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Recorded local acceptance on 10 September 2026 included a full
              pytest pass, local-closed readiness, and SQLite backup/restore.
              The claims register also records a Cloud CI and Security CI
              baseline pass on canonical application code.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              That is engineering evidence — not an uptime percentage, latency
              guarantee, SLA, or production-scale claim.
            </p>
          </article>

          <article className="rounded-[var(--mos-radius-lg)] border border-border bg-paper p-5">
            <h3 className="text-lg font-semibold text-ink">Trust boundaries</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Server rules retain safety, lifecycle and approval authority.
              Critical safety is designed to latch for authorised human review,
              and AI has no client-money execution authority.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {trustLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-ink hover:border-accent hover:text-accent"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-6 rounded-[var(--mos-radius-lg)] border border-dashed border-border bg-paper p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Pilot / case-study evidence slot
            </p>
            <span className="rounded-md border border-border bg-surface px-2 py-1 text-xs font-semibold text-muted">
              Awaiting publishable evidence
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-ink">
            Customer proof will appear only when it is real and permissioned.
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            A future pilot or case study must have a named evidence source,
            dated outcome, permission to publish, and claims review before any
            logo, quote, metric, or testimonial appears here.
          </p>
          <a
            href="#scenarios"
            className="mt-4 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            See labelled UK maintenance scenarios
          </a>
        </div>
      </div>
    </section>
  );
}
