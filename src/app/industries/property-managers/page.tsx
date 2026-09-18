import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = {
  title: "Property managers",
  description:
    "Multi-tenant maintenance ops with AI intake and deterministic controls.",
};

export default function Page() {
  return (
    <IndustryStubPage
      title="Multi-tenant maintenance ops with AI for intake - rules for the operation."
      lede="For UK property managers who run properties, residents, contractors, and work orders and need accountable triage without autonomous dispatch."
      job={[
        "Coordinating jobs across sites without a single structured intake spine.",
        "Safety-critical reports that must not be 'handled' by a model alone.",
        "Auditability: what was said, what was classified, what a human cleared.",
        "Supervisors need visibility; public customer portals are not the pre-launch promise.",
      ]}
      fit={[
        "Verified-in-source multi-tenant system spanning work orders, properties, residents, contractors, jobs, communications.",
        "Deterministic safety/lifecycle rules override AI.",
        "Critical safety latch requiring human clearance.",
        "Streamlit supervisor dashboard exists as internal supervisor tooling - do not present as a public customer portal GA.",
        "Customer portal / public account login: not available as GA - scaffold links only.",
      ]}
      safety="Tenant isolation and audit/action evidence are designed capabilities. No certifications invented."
      antiClaims="No fake PM firm logos. No claim of a dashboard for your residents today. No production call-pilot authorised claim."
    />
  );
}
