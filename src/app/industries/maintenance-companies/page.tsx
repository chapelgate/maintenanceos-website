import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = {
  title: "Maintenance companies",
  description:
    "Structured handoffs into jobs and communications - under testing.",
};

export default function Page() {
  return (
    <IndustryStubPage
      title="Cleaner handoffs into jobs and communications - under testing."
      lede="For maintenance companies that receive work from landlords, agents, and managers and need structured intake upstream of the job - without AI inventing dispatches."
      job={[
        "Incomplete job details from phone-only reporting.",
        "Disputes over what was promised on the call.",
        "Need for clear escalation when safety or access is unclear.",
        "Avoiding any system that auto-commits vans, slots, or fees.",
      ]}
      fit={[
        "Work orders, jobs, contractors, and communications are first-class in the product model (under testing for release).",
        "Intake is designed to collect caller details; rules block invented bookings/dispatches.",
        "Human transfer on explicit request keeps consequential commitments with people.",
        "Voice layer: built for UK terminology - under testing; further controlled testing underway.",
      ]}
      safety="No payment/refund authority. Safety latch + human clearance."
      antiClaims="No contractor marketplace pitch. No claim that we dispatch your team automatically. No invented SLA percentages."
    />
  );
}
