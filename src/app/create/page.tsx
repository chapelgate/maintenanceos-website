import {
  CalendarConnectSection,
  CreateJourneySection,
} from "@/components/create-funnel-islands";
import { CreateIngestPrivacyNote } from "@/components/CreateIngestPrivacyNote";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { funnelPageJsonLd } from "@/lib/json-ld";
import { funnelPageMetadata } from "@/lib/page-meta";

export const metadata = funnelPageMetadata("create");

const steps = [
  {
    title: "Share your website",
    body: "Enter a public site URL and an email so we can record the early access request.",
  },
  {
    title: "Check the URL",
    body: "We validate the public URL and use its hostname only as a setup hint. The public site does not crawl pages; missing details stay empty until reviewed or supplied.",
  },
  {
    title: "Review the draft",
    body: "You edit business name, greeting, hours, services, and FAQs before anything is stored. The business name may start from the website-address hint; missing fields are not invented.",
  },
  {
    title: "Preview the receptionist pack",
    body: "We turn the reviewed draft into a claims-safe knowledge pack and system prompt. You can edit them. Missing hours or services stay missing. This is not a live number and not always-on.",
  },
  {
    title: "Submit early access",
    body: "We queue an early access lead with your URL, draft JSON, knowledge pack, and prompt. No live phone number is assigned.",
  },
  {
    title: "Optional sandbox test (flagged)",
    body: "A sandbox test-call panel sits after the draft. Off by default it says under testing / coming. When enabled locally, one click runs a pack-aware scripted demo against your knowledge pack — not a live customer number.",
  },
] as const;

export default function CreateReceptionistPage() {
  return (
    <>
      <JsonLd data={funnelPageJsonLd("create")} />
      <PageHero
        eyebrow="Early access · Pre-launch"
        title="Start your AI receptionist setup from your website address"
        lede="Paste your site URL, review and complete the draft, preview a sandbox receptionist pack, and request early access. The URL is a setup hint; this public site does not crawl its pages or invent missing business facts. This form does not place a live call or assign a phone number."
      />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
        <FunnelPathStrip />
        <section aria-labelledby="create-form-heading">
          <h2
            id="create-form-heading"
            className="text-xl font-semibold text-ink"
          >
            Start with your website URL
          </h2>
          <p className="mt-2 text-sm text-muted">
            Next: check the URL, review the draft, preview the knowledge pack,
            then request early access. The sandbox panel below stays off unless
            a local flag is on — then a pack-aware scripted demo is one click.
            It never places a live customer call.
          </p>
          <div className="mt-6">
            <CreateJourneySection />
          </div>
          <CreateIngestPrivacyNote />
        </section>

        <CalendarConnectSection />

        <section aria-labelledby="create-steps-heading">
          <h2
            id="create-steps-heading"
            className="text-xl font-semibold text-ink"
          >
            How onboarding is designed to work
          </h2>
          <ol className="mt-4 list-decimal space-y-4 pl-5 text-muted">
            {steps.map((step) => (
              <li key={step.title}>
                <span className="font-medium text-ink">{step.title}.</span>{" "}
                {step.body}
              </li>
            ))}
          </ol>
        </section>

        <section
          className="mos-glass p-5 text-sm text-muted"
          aria-labelledby="create-limits-heading"
        >
          <h2 id="create-limits-heading" className="text-base font-semibold text-ink">
            Honest limits
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>AI voice and receptionist behaviour remain under testing</li>
            <li>
              This public site does not crawl the submitted website. The URL
              is used as a setup hint; missing business facts stay empty until
              reviewed or supplied
            </li>
            <li>
              This page does not claim a 30-second live phone number or commercial
              always-on service
            </li>
            <li>
              Calendar connect is coming / under testing unless a local adapter
              flag is on — this page never invents a booked confirmation
            </li>
            <li>
              The receptionist knowledge pack on this page is a sandbox draft
              from reviewed fields — not a live number, not always-on, and not a
              trained knowledge base. Missing hours or services stay missing.
            </li>
            <li>
              Sandbox test call is under testing / coming unless a local flag is
              on — this page never invents a live customer phone number
            </li>
            <li>
              Live telephony changes stay gated until controlled-call criteria
              pass. The frozen production voice path is not used here.
            </li>
          </ul>
          <p className="mt-3">
            Prefer a human briefing instead?{" "}
            <a
              href="/demo/#demo"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              Request early access
            </a>
            .
          </p>
        </section>
      </div>
    </>
  );
}
