import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = {
  title: "Housing associations",
  description:
    "Safety latch and escalation for accountable housing maintenance ops.",
};

export default function Page() {
  return (
    <IndustryStubPage
      title="Accountable intake for housing maintenance - humans clear what matters."
      lede="For UK housing associations and housing providers who need structured reporting, safety latching, and escalation queues without over-claiming live voice GA."
      job={[
        "Vulnerable residents and safety-critical fabric issues need clear escalation.",
        "Audit trails matter for governance - not marketing dashboards with fake KPIs.",
        "Multiple channels of report; phone still drops unstructured detail.",
        "Zero tolerance for a model inventing safety assurances or compensation promises.",
      ]}
      fit={[
        "Deterministic rules override AI on safety/lifecycle.",
        "Critical safety latch requiring human clearance.",
        "Escalation queues / human review in the designed control model.",
        "Must-not-invent controls for bookings, dispatches, refunds, compensation, account info, safety assurances.",
        "UK/999 guidance in source and regression tests - frame as designed behaviour; live-carrier retest still required.",
      ]}
      safety="No client-money or compensation execution. No ISO/SOC2 claims."
      antiClaims="No housing-provider customer list. No regulatory certification badges. No 'compliant out of the box' legal claims."
    />
  );
}
