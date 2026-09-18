import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = {
  title: "Councils",
  description:
    "Controlled intake language for public-sector maintenance evaluation.",
};

export default function Page() {
  return (
    <IndustryStubPage
      title="Controlled maintenance intake language for public-sector teams."
      lede="For council and local-authority maintenance contacts evaluating early access - honest about pilot stage, strict about safety and money boundaries."
      job={[
        "Public callers expect clarity; systems must not over-promise.",
        "Emergency wording must follow UK practice (999), not improvised scripts.",
        "Procurement-sensitive evaluation: no fake readiness or certifications.",
        "Need human clearance on critical safety paths.",
      ]}
      fit={[
        "Built for UK terminology - under testing (including 999 guidance where relevant).",
        "Deterministic safety latch and escalation queues.",
        "Explicit-request human transfer; no inventing of safety assurances or compensation.",
        "Pre-launch only: join list / early demo briefing - not a live public service claim.",
      ]}
      safety="Tenant isolation and audit framing only as designed capabilities. No procurement win claims."
      antiClaims="No 'approved for local government' badges. No named council customers. No live telephony GA."
    />
  );
}
