import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = { title: "Landlords" };

export default function Page() {
  return (
    <IndustryStubPage
      title="Landlords"
      audience="For private and portfolio landlords who need clear maintenance accountability."
      focus={[
    "Resident-reported repairs into structured work orders",
    "Visibility without drowning in unstructured messages",
    "Human clearance on safety-critical paths"
  ]}
    />
  );
}
