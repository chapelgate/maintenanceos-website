import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = {
  title: "Facilities management",
  description:
    "Site triage with human clearance and audit framing. Pre-launch.",
};

export default function Page() {
  return (
    <IndustryStubPage
      title="Site maintenance triage with clearance and audit in the loop."
      lede="For facilities management teams coordinating sites, contractors, and urgent reports - AI for capture, rules and people for consequential steps."
      job={[
        "Mixed urgent and routine reports across sites.",
        "Need for consistent classification before a contractor moves.",
        "Evidence of what was approved vs what a model suggested.",
        "Avoiding chatbot-style 'we have fixed it' language.",
      ]}
      fit={[
        "Multi-tenant properties, contractors, work orders, jobs, communications.",
        "Controlled triage via deterministic server rules.",
        "Audit events / action evidence as designed trust capability.",
        "Human oversight for transfer and clearance; no autonomous dispatch story.",
      ]}
      safety="Money prohibitions apply."
      antiClaims="No FM enterprise logos. No uptime or site-count vanity metrics. No claim that AI runs your FM operation."
    />
  );
}
