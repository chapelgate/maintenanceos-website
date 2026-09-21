import { CtaPair } from "@/components/CtaPair";
import { DemoConversionTabs } from "@/components/DemoConversionTabs";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";
import { CREATE_JOURNEY_STEPS } from "@/lib/onboarding-create";

export const metadata = contentPageMetadata({
  title: "Start from your website — or request early access",
  description:
    "Website URL → check → review draft → knowledge pack → optional scripted sandbox → early access. Pre-launch — not a live phone number.",
  path: "/demo/",
});

const FUNNEL_COPY = [
  "Paste a public site URL and an email so we can record the early access request.",
  "If a scan service is configured we ask it for a draft. If not, the crawl is queued — we do not invent extracted hours or services.",
  "You edit the draft before anything is stored. Empty fields were not invented.",
  "The reviewed draft becomes a knowledge pack and system prompt. Missing hours or services stay missing.",
] as const;

const pathSteps = [
  ...CREATE_JOURNEY_STEPS.map((step, i) => {
    const body = FUNNEL_COPY[i];
    if (!body) {
      throw new Error(`Missing /demo copy for ${step.label}`);
    }
    return { title: step.label, body };
  }),
  {
    title: "Optional scripted sandbox",
    body: "When a local flag is on, a pack-aware scripted demo can run against the stored knowledge pack. It is under testing and off by default. It is not a live customer call.",
  },
  {
    title: "Early access",
    body: "Submit the create form, join the launch list, or ask for a human briefing. None of these provision a live phone number.",
  },
];

export default function DemoPage() {
  return (
    <>
      <PageHero
        eyebrow="Pre-launch. Not a live phone."
        title="Start from your website URL."
        lede="The honest path is website URL → check → review draft → knowledge pack → optional scripted sandbox → early access. Create from your site, or request a human briefing. This page does not assign a live number."
      />

      <section
        aria-labelledby="demo-path-heading"
        className="mx-auto max-w-3xl px-4 pt-10"
      >
        <h2
          id="demo-path-heading"
          className="text-lg font-semibold text-ink"
        >
          The public path
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Same steps as{" "}
          <a
            href="/create/"
            className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
          >
            Create from website
          </a>
          . Website → Check → Review → Pack, then optional sandbox and early
          access. We do not invent crawl results or a live phone number.
        </p>
        <ol className="mt-6 space-y-4">
          {pathSteps.map((step, i) => (
            <li key={step.title}>
              <p className="text-sm font-semibold text-ink">
                {i + 1}. {step.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <CtaPair
          className="mt-8"
          primaryHref="/create/"
          primaryLabel="Create from website"
          secondaryHref="#demo"
          secondaryLabel="Request early access"
        />
      </section>

      <section
        aria-labelledby="demo-not-heading"
        className="mx-auto max-w-3xl px-4 pt-10"
      >
        <h2 id="demo-not-heading" className="text-lg font-semibold text-ink">
          What this is not
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
          <li>Not a self-serve “call our AI now” public demo.</li>
          <li>Not live number provisioning or a public always-on line.</li>
          <li>Not a production telephony GO.</li>
          <li>Not a promise of autonomous job booking or payments.</li>
        </ul>
      </section>

      <section
        aria-labelledby="demo-briefing-heading"
        className="mx-auto max-w-3xl px-4 pt-10"
      >
        <h2
          id="demo-briefing-heading"
          className="text-lg font-semibold text-ink"
        >
          Prefer a human briefing?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Join the launch list or request early access below. This is a human
          follow-up — not live number provisioning.
        </p>
      </section>
      {/* launch_list + early_demo both render LeadCaptureForm inside DemoConversionTabs. */}
      <DemoConversionTabs />
    </>
  );
}
