import { CreateReceptionistForm } from "@/components/CreateReceptionistForm";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Create your AI receptionist",
  description:
    "Paste your business website URL, review a draft, and request website-to-receptionist early access. Pre-launch — this form does not provision a live phone number.",
  path: "/create/",
});

const steps = [
  {
    title: "Share your website",
    body: "Enter a public site URL and an email so we can record the early access request.",
  },
  {
    title: "Check the URL",
    body: "If a scan service is configured we ask it for a draft. If not, the crawl is queued — we do not invent extracted content.",
  },
  {
    title: "Review the draft",
    body: "You edit business name, greeting, hours, services, and FAQs before anything is stored.",
  },
  {
    title: "Submit early access",
    body: "We queue an early access lead with your URL and draft JSON. No live phone number is assigned.",
  },
] as const;

export default function CreateReceptionistPage() {
  return (
    <>
      <PageHero
        eyebrow="Early access · Pre-launch"
        title="Turn your business website into an AI receptionist"
        lede="Paste your site URL, review a draft, and request website-to-receptionist early access. If no scan service is configured, the crawl is queued — we do not invent crawl results. This form does not place a live call or assign a phone number."
      />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
        <section aria-labelledby="create-form-heading">
          <h2
            id="create-form-heading"
            className="text-xl font-semibold text-ink"
          >
            Start with your website URL
          </h2>
          <p className="mt-2 text-sm text-muted">
            We will only contact you about early access for this product. No
            fabricated live demo or test-call button runs from this page.
          </p>
          <div className="mt-6">
            <CreateReceptionistForm />
          </div>
        </section>

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

        <section className="rounded-md border border-border bg-surface p-5 text-sm text-muted">
          <h2 className="text-base font-semibold text-ink">Honest limits</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>AI voice and receptionist behaviour remain under testing</li>
            <li>
              Website crawl is queued unless an external scan endpoint is
              configured — this page will not invent extracted content
            </li>
            <li>
              This page does not claim a 30-second live phone number or commercial
              always-on service
            </li>
            <li>
              Live telephony changes stay gated until controlled-call criteria
              pass
            </li>
          </ul>
          <p className="mt-3">
            Prefer a briefing instead?{" "}
            <a
              href="/demo/"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              Request an early demo
            </a>
            .
          </p>
        </section>
      </div>
    </>
  );
}
