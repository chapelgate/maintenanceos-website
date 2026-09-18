import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = {
  title: "Holiday lets",
  description:
    "Guest maintenance calls structured without autonomous dispatch.",
};

export default function Page() {
  return (
    <IndustryStubPage
      title="Guest maintenance calls, structured - without autonomous dispatch."
      lede="For UK holiday-let operators who get out-of-hours guest reports and need clear capture, safety boundaries, and human handover - not a model inventing engineer visits."
      job={[
        "Guests calling about boilers, access, leaks - often outside office hours.",
        "Risk of anyone promising a contractor visit or compensation on the spot.",
        "Owners/managers need structured notes tied to the property.",
        "Want UK-appropriate emergency guidance if a guest describes danger.",
      ]}
      fit={[
        "Intake designed to collect caller details and classify issues (voice under testing).",
        "Rules own safety latch, escalations, approvals; AI must not invent dispatches, bookings, refunds, or compensation.",
        "Multi-tenant properties and communications model supports property-scoped ops (under testing for release).",
        "Explicit-request human transfer when a person must decide.",
      ]}
      safety="No payment/refund/compensation authority."
      antiClaims="No OTA partnership badges. No occupancy or booking-channel integrations as live features. No '24/7 live guest line' claim."
    />
  );
}
