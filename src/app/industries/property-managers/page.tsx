import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = { title: "Property managers" };

export default function Page() {
  return (
    <IndustryStubPage
      title="Property managers"
      audience="For property managers running day-to-day maintenance operations."
      focus={[
    "Work orders, jobs, and communications in one operational picture",
    "Escalation queues for human review",
    "Deterministic rules ahead of AI suggestions"
  ]}
    />
  );
}
