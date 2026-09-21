import { CtaPair } from "@/components/CtaPair";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { funnelPageJsonLd } from "@/lib/json-ld";
import { funnelPageMetadata } from "@/lib/page-meta";

export const metadata = funnelPageMetadata("features");

const groups = [
  {
    heading: "HAVE",
    status: "Present now in this website or product source · still pre-launch",
    cards: [
      {
        title: "Website → receptionist funnel",
        items: [
          "Public /create funnel: Website → Check → Review → Pack, then an early access lead. Exists today. Not a live receptionist or a 30-second phone number.",
          "Scripted conversation benchmark for the pack-aware sandbox path — hours and services from the pack, UK 999, no invented bookings. Passing the runner is not voice-quality parity.",
        ],
      },
      {
        title: "Operations platform",
        items: [
          "Multi-tenant maintenance operations — each tenant’s data stays scoped to that organisation",
          "Tenant-scoped properties, residents, contractors, work orders / jobs, and communications",
          "Exports and call-session records as part of the operating trail",
          "Action evidence so affirmative operational claims can be tied to verified outcomes",
          "Internal supervisor dashboard (Streamlit) for operators — not a public customer portal or self-serve billing product",
        ],
      },
      {
        title: "Safety and control",
        items: [
          "Deterministic server rules own safety, lifecycle, and approvals — the AI does not override them",
          "Critical-safety latch that requires authorised human clearance before progressing",
          "Escalation / human-review queues for RED and other cases that need a person",
          "Quote and invoice checks exist in product source",
          "No payment, refund, compensation, fee-waiver, or client-money execution authority — for AI or automated money movement",
        ],
      },
      {
        title: "UK receptionist behaviour",
        items: [
          "UK terminology and 999 emergency guidance (never 911) in product source and regressions",
          "Receptionist designed to collect caller details into structured intake",
          "Explicit caller-request human transfer supported in source (shared policy across voice providers)",
          "Must not invent bookings, dispatches, refunds, compensation, account information, or safety assurances",
        ],
      },
      {
        title: "Security and evidence",
        items: [
          "Tenant isolation controls in source",
          "Twilio HTTP / WSS signature verification implemented in source",
          "Audit events and action-evidence patterns; affirmative claims need verified success evidence",
          "Cloud CI and security CI baselines on canonical application code",
        ],
      },
    ],
  },
  {
    heading: "UNDER TEST",
    status: "Designed or flagged — not general availability",
    cards: [
      {
        title: "Sandbox path",
        items: [
          "SSRF-safe website scan companion — copies draft fields when a scan endpoint is configured; otherwise the crawl is queued. Empty fields were not invented. Not a live Fonio-parity knowledge crawl.",
          "Knowledge pack + system prompt from the reviewed /create draft. Missing hours or services stay missing. Not a live tenant or trained knowledge base.",
          "Pack-aware scripted sandbox test call — flagged, off by default. Answers from the stored pack; missing fields stay not on file. Not a live customer phone. Frozen telephony unused.",
        ],
      },
      {
        title: "Calendars",
        items: [
          "Calendar connect — flagged adapters (mock plus Google / Microsoft 365 OAuth scaffolds). /create says coming / under testing unless a local flag is on. This site never invents a booked confirmation. Not customer-GA; not live on staging.",
        ],
      },
      {
        title: "Voice and dashboard",
        items: [
          "AI receptionist voice (Gemini Live primary in product configuration) exists in source and is under testing — not a live commercial always-on service",
          "Historical validation / receptionist calls have occurred in a test context — not commercial general availability",
          "A fresh controlled call on the current consolidated stack is still required before any production always-on voice claim",
          "Flagged /dashboard foundation for call history, SAMPLE transcripts, and a bookings stub — off by default",
          "When the dashboard flag is off the page says coming / under testing and does not show sample rows as live product",
          "SAMPLE / DEMO dashboard rows are labelled examples; an empty store does not invent customers",
        ],
      },
    ],
  },
  {
    heading: "COMING",
    status: "Not live — do not treat as available",
    cards: [
      {
        title: "Live phone",
        items: [
          "Live always-on customer phone — production telephony stays frozen until controlled-call criteria pass. We do not publish a public live phone line or concurrent multi-line capacity figures.",
        ],
      },
      {
        title: "Calendars as a live product",
        items: [
          "Customer-facing live calendar book / reschedule — adapters exist under test; Google / Microsoft 365 Calendar is not live on staging and has no voice booking confirmation.",
        ],
      },
      {
        title: "Commercial GA",
        items: [
          "Commercial general availability, public customer portal, account login, or billing.",
        ],
      },
    ],
  },
] as const;

const notOnThisSite = [
  "Commercially live / generally available product",
  "Public always-on customer phone receptionist",
  "Public customer portal, account login, or billing GA",
  "ISO / SOC 2 / bank-grade / other certifications we have not earned",
  "Fake uptime, logos, awards, or reviews",
  "Payment, refund, or client-money execution",
] as const;

export default function FeaturesPage() {
  return (
    <>
      <JsonLd data={funnelPageJsonLd("features")} />
      <PageHero
        eyebrow="Capability map · Pre-launch"
        title="What MaintenanceOS includes — HAVE, UNDER TEST, COMING"
        lede="This map follows the signed product claims register. HAVE is present in this website or product source. UNDER TEST includes sandbox, calendars, and voice. COMING includes live phone. Nothing here claims commercial general availability or a public always-on phone line."
      />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
        {groups.map((g) => (
          <section key={g.heading} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink">{g.heading}</h2>
              <p className="mt-1 text-sm font-medium text-accent">{g.status}</p>
            </div>
            {g.cards.map((card) => (
              <article
                key={card.title}
                className="mos-glass p-5"
              >
                <h3 className="text-base font-semibold text-ink">{card.title}</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
                  {card.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
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
          . Funnel:{" "}
          <a href="/how-it-works/" className="text-accent underline">
            How it works
          </a>
          {" · "}
          <a href="/create/" className="text-accent underline">
            Create from website
          </a>
          .
        </p>
        <CtaPair
          primaryHref="/create/"
          primaryLabel="Create from website"
          secondaryHref="/demo/#launch"
          secondaryLabel="Join launch list"
        />
      </div>
    </>
  );
}
