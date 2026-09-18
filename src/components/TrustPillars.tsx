/**
 * Trust pillars for /security — claims-gated (PRODUCT_CLAIMS_REGISTER).
 * Tenant isolation, human clearance, audit evidence. No cert theatre.
 */
const PILLARS = [
  {
    id: "tenant-isolation",
    title: "Tenant isolation",
    short: "Boundaries between organisations",
    body: "Designed as a first-class trust boundary so one organisation's data and actions stay inside its tenant. Multi-tenant operations exist in product source and are under testing — not commercially generally available.",
  },
  {
    id: "human-clearance",
    title: "Human clearance",
    short: "People decide consequential safety",
    body: "A critical safety latch requires a person before consequential action. Deterministic safety and lifecycle rules override AI. Escalation queues are designed for human review — not unsupervised autonomy.",
  },
  {
    id: "audit-evidence",
    title: "Audit evidence",
    short: "Actions should be reviewable",
    body: "Work is designed to leave audit-oriented event trails and action evidence tied to the operation, so supervisors can see what happened — not only what a model suggested.",
  },
] as const;

export function TrustPillars() {
  return (
    <section
      aria-labelledby="pillars-heading"
      className="mx-auto max-w-6xl px-4 py-12"
    >
      <h2 id="pillars-heading" className="text-2xl font-semibold text-ink">
        What this product is designed to control
      </h2>
      <p className="mt-2 max-w-2xl text-muted">
        Three controls we can describe from product design and source. Wording
        stays in designed / under testing — never certified or generally
        available.
      </p>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {PILLARS.map((pillar) => (
          <li key={pillar.id}>
            <article className="flex h-full flex-col rounded-lg border border-border bg-surface p-5 shadow-[0_1px_2px_rgb(15_23_42_/_6%),0_8px_24px_rgb(15_23_42_/_6%)]">
              <h3 className="text-lg font-semibold text-ink">{pillar.title}</h3>
              <p className="mt-1 text-sm font-medium text-accent">
                {pillar.short}
              </p>
              <p className="mt-3 flex-1 text-sm text-muted">{pillar.body}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
