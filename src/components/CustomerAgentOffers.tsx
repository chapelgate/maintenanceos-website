import { AGENT_TEMPLATES, agentRoleSlug } from "@/lib/agent-selection";
import type { AgentType } from "@/lib/agent-blueprint";

const OFFER_LINE: Record<AgentType, string> = {
  receptionist: "Messages, and a transfer when someone asks.",
  maintenance_desk: "A structured repair job from the call.",
  booking_assistant: "Questions about appointments.",
  customer_service: "Support questions and a message.",
  sales_enquiry: "Qualified enquiries, with no commitments.",
  custom: "A safe starting point you refine next.",
};

export function CustomerAgentOffers() {
  return (
    <section
      id="agent-offers"
      className="border-b border-border bg-surface px-4 py-12 sm:px-6 sm:py-16"
      aria-labelledby="agent-offers-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <h2
            id="agent-offers-heading"
            className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
          >
            Choose what you want the AI to do
          </h2>
        </div>

        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {AGENT_TEMPLATES.map((template) => (
            <li
              key={template.type}
              className="flex h-full flex-col rounded-[var(--mos-radius-lg)] border border-border bg-paper p-5"
              data-agent-offer={template.type}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-ink">{template.label}</h3>
                <span className="rounded-full bg-accent-subtle px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
                  Early access
                </span>
              </div>
              <p className="mt-3 grow text-sm leading-relaxed text-muted">
                {OFFER_LINE[template.type]}
              </p>
              <a
                href={`/create/?role=${agentRoleSlug(template.type)}`}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-accent px-4 py-2.5 text-sm font-semibold text-accent hover:bg-accent-subtle"
              >
                Choose {template.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs leading-relaxed text-muted">
          Choosing a role prepares a reviewed configuration only. It does not
          buy a plan, provision a number, or activate a live phone service.
        </p>
      </div>
    </section>
  );
}
