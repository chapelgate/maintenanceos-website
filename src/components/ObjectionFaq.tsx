import { objectionFaqItems } from "@/content/objection-faqs";

/**
 * Muted paper accordion — exclusive native <details name>.
 * One open at a time. No per-question CTAs.
 */
export function ObjectionFaq({
  headingId = "objection-faq-heading",
}: {
  headingId?: string;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <h2
        id={headingId}
        className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
      >
        Straight answers before you start
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Pre-launch honesty — not a live phone, not peer feature parity.
      </p>
      <div className="objection-faq mt-6 space-y-2">
        {objectionFaqItems.map((item) => (
          <details key={item.question} name="mos-objection-faq" className="objection-faq-item">
            <summary className="objection-faq-summary">{item.question}</summary>
            <p className="objection-faq-answer">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
