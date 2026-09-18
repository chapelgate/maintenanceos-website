import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = {
  title: "Landlords",
  description:
    "Structured maintenance intake for UK landlords. Rules own safety and money boundaries. Pilot-stage.",
};

export default function Page() {
  return (
    <IndustryStubPage
      title="Maintenance calls that become structured work - not inventing the job."
      lede="For UK landlords who need caller details captured clearly, safety paths that latch for a person, and no AI authority over money or dispatches."
      job={[
        "Missed or half-reported maintenance calls when you cannot pick up.",
        "Residents describing emergencies in everyday language - you need structure, not improvisation.",
        "Risk of anyone (human or model) promising refunds, bookings, or 'we will send someone now' without a process.",
        "Wanting a system that respects UK emergency guidance (999), not US defaults.",
      ]}
      fit={[
        "Intake: AI receptionist layer is designed to collect caller details and classify issues in UK maintenance language - under testing, not a public always-on line.",
        "Controlled triage: Deterministic rules own lifecycle, escalations, and approvals. Critical safety paths are designed to latch until a person clears them.",
        "Human oversight: Callers can request a live transfer (explicit request). The system is designed not to invent bookings, dispatches, refunds, or safety assurances.",
        "Ops objects: Multi-tenant properties, residents, contractors, work orders, jobs, and communications exist in product source and are under testing for release.",
      ]}
      safety="No payment, refund, compensation, fee-waiver, or client-money execution authority. See Security for tenant isolation and audit framing."
      antiClaims="No claim that landlords already live on our phone line. No fabricated landlord logos or occupancy stats. No concurrent-line marketing numbers."
    />
  );
}
