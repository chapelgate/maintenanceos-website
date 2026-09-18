import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Features",
  description:
    "Capability map for MaintenanceOS operations, safety controls, and audit trails. Designed, built, and under testing — not commercial general availability.",
  path: "/features/",
});

const groups = [
  {
    heading: "Operations (under testing)",
    items: [
      "Multi-tenant maintenance operations for properties, residents, contractors, and jobs",
      "Work orders and communications designed as a single accountable trail",
      "Internal supervisor tooling for review — not a public customer portal GA",
    ],
  },
  {
    heading: "Safety & control (core design)",
    items: [
      "Deterministic safety and lifecycle rules that override AI suggestions",
      "Critical safety latch requiring human clearance",
      "Escalation queues for human review before consequential action",
      "No payment, refund, compensation, or client-money execution authority for AI",
    ],
  },
  {
    heading: "Audit & evidence (built / under testing)",
    items: [
      "Action evidence and audit-oriented event trails",
      "Tenant isolation as a first-class trust boundary",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Capability map"
        title="Features designed for accountable maintenance"
        lede="We use careful language: designed, built, and under testing. Nothing here claims commercial general availability."
      />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
        {groups.map((g) => (
          <section key={g.heading}>
            <h2 className="text-xl font-semibold text-ink">{g.heading}</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
              {g.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
        <p className="text-sm text-muted">
          Voice / AI receptionist details:{" "}
          <a href="/ai-receptionist/" className="text-accent underline">
            AI receptionist
          </a>
          . Trust posture:{" "}
          <a href="/security/" className="text-accent underline">
            Security
          </a>
          .
        </p>
        <CtaPair />
      </div>
    </>
  );
}
