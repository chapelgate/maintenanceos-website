import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = { title: "Housing associations" };

export default function Page() {
  return (
    <IndustryStubPage
      title="Housing associations"
      audience="For housing providers and associations managing resident repairs."
      focus={[
    "Accountable intake and triage patterns",
    "Safety latch requiring human clearance",
    "Audit-oriented evidence for consequential actions"
  ]}
    />
  );
}
