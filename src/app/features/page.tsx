import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Features",
  description:
    "MaintenanceOS capability map aligned to the signed product claims register: multi-tenant operations, deterministic safety controls, UK intake behaviour, and audit evidence. Pre-launch — not commercial general availability.",
  path: "/features/",
});

const groups = [
  {
    heading: "Operations platform",
    status: "Present in product source · Pre-launch",
    items: [
      "Multi-tenant maintenance operations — each tenant’s data stays scoped to that organisation",
      "Tenant-scoped properties, residents, contractors, work orders / jobs, and communications",
      "Exports and call-session records as part of the operating trail",
      "Action evidence so affirmative operational claims can be tied to verified outcomes",
      "Internal supervisor dashboard (Streamlit) for operators — not a public customer portal or self-serve billing product",
    ],
  },
  {
    heading: "Safety and control",
    status: "Present in product source · Pre-launch",
    items: [
      "Deterministic server rules own safety, lifecycle, and approvals — the AI does not override them",
      "Critical-safety latch that requires authorised human clearance before progressing",
      "Escalation / human-review queues for RED and other cases that need a person",
      "Quote and invoice checks exist in product source",
      "No payment, refund, compensation, fee-waiver, or client-money execution authority — for AI or automated money movement",
    ],
  },
  {
    heading: "UK receptionist behaviour (designed in product)",
    status: "Present in product design / source · Pre-launch",
    items: [
      "UK terminology and 999 emergency guidance (never 911) in product source and regressions",
      "Receptionist designed to collect caller details into structured intake",
      "Explicit caller-request human transfer supported in source (shared policy across voice providers)",
      "Must not invent bookings, dispatches, refunds, compensation, account information, or safety assurances",
    ],
  },
  {
    heading: "Security and evidence",
    status: "Present in product source · Pre-launch",
    items: [
      "Tenant isolation controls in source",
      "Twilio HTTP / WSS signature verification implemented in source",
      "Audit events and action-evidence patterns; affirmative claims need verified success evidence",
      "Cloud CI and security CI baselines on canonical application code",
    ],
  },
  {
    heading: "AI receptionist voice",
    status: "Under testing — not a live commercial always-on service",
    items: [
      "AI receptionist (Gemini Live primary in product configuration) exists in source and is under testing",
      "Historical validation / receptionist calls have occurred in a test context — not commercial general availability",
      "A fresh controlled call on the current consolidated stack is still required before any production always-on voice claim",
      "We do not publish concurrent multi-line capacity figures or claim a public live phone line",
    ],
  },
] as const;

const notOnThisSite = [
  "Commercially live / generally available product",
  "Public always-on customer phone receptionist",
  "Public customer portal, account login, or billing GA",
  "ISO / SOC 2 / other certifications we have not earned",
  "Fake uptime, logos, awards, or reviews",
  "Payment, refund, or client-money execution",
] as const;

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Capability map · Pre-launch"
        title="What MaintenanceOS includes — stated carefully"
        lede="This map follows the signed product claims register and the MaintenanceOS pilot source. Capabilities below are present in product design or source unless marked under testing. Nothing here claims commercial general availability or a public always-on phone line."
      />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
        {groups.map((g) => (
          <section key={g.heading}>
            <h2 className="text-xl font-semibold text-ink">{g.heading}</h2>
            <p className="mt-1 text-sm font-medium text-accent">{g.status}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
              {g.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}

        <section>
          <h2 className="text-xl font-semibold text-ink">Not claimed on this site</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            {notOnThisSite.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <p className="text-sm text-muted">
          Voice detail:{" "}
          <a href="/ai-receptionist/" className="text-accent underline">
            AI receptionist
          </a>
          . Trust posture:{" "}
          <a href="/security/" className="text-accent underline">
            Security
          </a>
          . Flow:{" "}
          <a href="/how-it-works/" className="text-accent underline">
            How it works
          </a>
          .
        </p>
        <CtaPair />
      </div>
    </>
  );
}
