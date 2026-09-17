import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = { title: "Letting agents" };

export default function Page() {
  return (
    <IndustryStubPage
      title="Letting agents"
      audience="For letting agents coordinating repairs across landlord portfolios."
      focus={[
    "Shared intake across properties and landlords",
    "Contractor coordination with an audit trail",
    "AI-assisted intake under testing — not a live commercial call centre claim"
  ]}
    />
  );
}
