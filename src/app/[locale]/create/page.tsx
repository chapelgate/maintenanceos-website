import { EnquiryUnavailable } from "@/components/EnquiryUnavailable";
import {
  CalendarConnectSection,
  CreateJourneySection,
} from "@/components/create-funnel-islands";
import { ChatWidget } from "@/components/ChatWidget";
import { CreateIngestPrivacyNote } from "@/components/CreateIngestPrivacyNote";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { fullFunnelPageJsonLd } from "@/lib/json-ld";
import { funnelPageMetadata } from "@/lib/page-meta";
import { siteConfig } from "@/config/site";

export const metadata = funnelPageMetadata("create");

const steps = [
  {
    title: "Share your website",
    body: "Enter your public site URL and email so we can prepare a repair-intake preview you can test in the browser.",
  },
  {
    title: "Check the URL",

    body: "We read a small, bounded set of public pages and extract business facts for you to review. Missing details stay empty rather than being invented.",

  },
  {
    title: "Review the draft",
    body: "You edit business name, greeting, hours, services, and FAQs before anything is stored. The business name may start from the website-address hint; missing fields are not invented.",
  },
  {
    title: "Build the receptionist",
    body: "We turn the reviewed details into a knowledge pack and controlled receptionist configuration. You can edit it, and missing information stays missing.",
  },
  {
    title: "Try your receptionist",
    body: "Start the interactive receptionist demo and ask your own caller questions against the configuration you just reviewed.",
  },
  {
    title: "Save your setup (optional)",
    body: "Online enquiries are temporarily unavailable. Please use the email link above. The browser preview does not store the setup.",
  },
] as const;

export default function CreateReceptionistPage() {
  return (
    <>
      <JsonLd data={fullFunnelPageJsonLd("create")} />
      <PageHero

        eyebrow="Repair intake · Preview"
        title="Turn your business website into a repair-intake preview"
        lede="Paste your site URL so MaintenanceOS can read public facts for a repair-intake preview, review them, then try a browser voice call. Online enquiries are temporarily unavailable, so the preview is not stored. It does not change your live telephone service, book viewings, or write into a CRM."

      />
      {siteConfig.demoPhoneNumber && (
        <div className="mx-auto max-w-3xl px-4 pb-6">
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-sm">
            <p className="font-medium text-ink">
              Live demo number available:
            </p>
            <p className="mt-1">
              <a
                href={`tel:${siteConfig.demoPhoneNumber}`}
                className="text-accent underline-offset-2 hover:no-underline font-medium"
              >
                {siteConfig.demoPhoneNumber}
              </a>
              {" — call 24/7 for AI greeting and basic intake. Not a production answering service."}
            </p>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
        <FunnelPathStrip linked />
        <section aria-labelledby="create-form-heading">
          <h2
            id="create-form-heading"
            className="text-xl font-semibold text-ink"
          >
            Start with your website URL
          </h2>
          <p className="mt-2 text-sm text-muted">
            Next: read the public website, review the extracted facts, configure
            the receptionist, then start a browser voice call. The preview stays
            in this browser.
          </p>
          <div className="mt-6">
            <EnquiryUnavailable />
          </div>
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
            <li>
              Website learning is read-only, limited to a small set of public
              HTTPS pages, honours robots.txt, and blocks private or internal
              network targets.
            </li>
            <li>
              Extracted facts are shown for review. If opening hours, services
              or other details are not found, they stay missing rather than being
              invented.
            </li>
            <li>
              The voice call runs in your browser using the reviewed knowledge
              pack. It does not assign or dial a public telephone number.
            </li>
            <li>
              The live telephone service remains isolated and is not changed by
              anything on this page.
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
          <p className="mt-3">
            See our{" "}
            <a
              href="/trust/"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              Trust & verification
            </a>
            {" "}
            page for legal entity, DPIA status, recording disclosure, and
            certification facts.
          </p>
        </section>
      </div>
      <ChatWidget pageContext="create" title="Questions about the preview?" />
    </>
  );
}
