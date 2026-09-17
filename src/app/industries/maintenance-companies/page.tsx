import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = { title: "Maintenance companies" };

export default function Page() {
  return (
    <IndustryStubPage
      title="Maintenance companies"
      audience="For maintenance companies delivering contracted repairs."
      focus={[
    "Job clarity and evidence for completed work",
    "Coordination with agents and landlords",
    "No invented dispatch promises from AI"
  ]}
    />
  );
}
