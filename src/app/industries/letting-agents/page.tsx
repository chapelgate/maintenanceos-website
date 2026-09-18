import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = {
  title: "Letting agents",
  description:
    "Portfolio maintenance intake for UK letting agents. Pre-launch briefing available.",
};

export default function Page() {
  return (
    <IndustryStubPage
      title="Portfolio maintenance intake without the model running the agency."
      lede="For UK letting agents who need consistent caller capture across landlords and tenants, with rules - not improvisation - owning safety and money boundaries."
      job={[
        "High call volume across many properties; notes get lost between phones and inboxes.",
        "Tenants and landlords both calling - roles and permissions must stay clear.",
        "Pressure to 'just sort it' while liability sits with the agency and landlord.",
        "Need for escalation queues when something must wait for a person.",
      ]}
      fit={[
        "Multi-tenant maintenance-operations design: properties, residents, contractors, work orders, jobs, communications.",
        "AI collects and classifies; server rules own consequential decisions.",
        "Escalation queues / human review are part of the designed control model.",
        "Explicit-request human transfer supported in source; quality still under retest.",
        "Quotes/invoices checks may exist in product; no payment or refund authority - never market as billing automation.",
      ]}
      safety="Money and safety stay out of the model's hands."
      antiClaims="No agency case studies. No claim that this replaces your helpdesk today. No live multi-line production scale numbers."
    />
  );
}
