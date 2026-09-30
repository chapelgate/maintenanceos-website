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
    body: "Enter your public site URL and email so we can prepare a receptionist preview you can test in the browser.",
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
    title: "Build the receptionist",
    body: "We turn the reviewed details into a knowledge pack and controlled receptionist configuration. You can edit it, and missing information stays missing.",
  },
  {
    title: "Try your receptionist",
    body: "Start the interactive receptionist demo and ask your own caller questions against the configuration you just reviewed.",
  },
  {
    title: "Save your setup (optional)",
    body: "If you want a record of the setup, save it and we will email you the durable reference. Saving is separate from the interactive demo.",
  },
] as const;

export default function CreateReceptionistPage() {
  return (
    <>
      <JsonLd data={funnelPageJsonLd("create")} />
      <PageHero

        eyebrow="Create your receptionist · Preview"
        title="Turn your business website into an AI receptionist"
        lede="Paste your site URL, configure the receptionist, review the knowledge pack, then press Try your receptionist and ask your own caller questions in the browser. You can optionally save the setup and receive a reference by email. The browser demo does not dial a phone number or touch the live telephone service."

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
            Next: check the URL, choose the role, configure the receptionist,
            review the pack, then try it interactively in the browser. Saving the
            setup and emailing a reference is optional.
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
            <li>The interactive browser receptionist is available here; live telephone calling remains a separate commissioning path</li>
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
              Calendar connection is not active in the public preview yet; this page never invents a booked confirmation
            </li>
            <li>
              The receptionist knowledge pack on this page is a preview configuration built from reviewed fields. Missing hours or services stay missing.
            </li>
            <li>
              The interactive receptionist demo runs in the browser from the reviewed pack. It never invents a live customer phone number
            </li>
            <li>
              The live telephone service is isolated from this browser demo and is not changed by anything on this page.
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
