import { objectionFaqItems } from "@/content/objection-faqs";

/**
 * Muted paper accordion — exclusive native <details name>.
 * One open at a time. No per-question CTAs.
 */
const GUARDRAIL_QUESTIONS = [
  "What if the caller asks for a person?",
  "Can the AI dispatch a contractor?",
  "What happens if the system encounters an unknown issue?",
];

export function ObjectionFaq({
  headingId = "objection-faq-heading",
}: {
  headingId?: string;
}) {
  const items = objectionFaqItems.filter((i) =>
    GUARDRAIL_QUESTIONS.includes(i.question)
  );
  const displayItems = items.length > 0 ? items : objectionFaqItems;

  return (
    <section
      aria-labelledby={headingId}
      className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12"
    >
      <h2
        id={headingId}
        className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
      >
        Straight answers before you start
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Pre-launch honesty — what the assistant does and where its boundaries lie.
      </p>
      <div className="objection-faq mt-4 space-y-2">
        {displayItems.map((item) => (
          <details key={item.question} name="mos-objection-faq" className="objection-faq-item">
            <summary className="objection-faq-summary">{item.question}</summary>
            <p className="objection-faq-answer">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
