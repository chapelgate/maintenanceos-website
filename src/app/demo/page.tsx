import { CtaPair } from "@/components/CtaPair";
import { DemoProof } from "@/components/DemoProof";
import { DeferredDemoConversionTabs } from "@/components/DeferredDemoConversionTabs";
import { FeatureStatusChip } from "@/components/FeatureStatusChip";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { fullFunnelPageJsonLd } from "@/lib/json-ld";
import { funnelPageMetadata } from "@/lib/page-meta";
import { CREATE_JOURNEY_STEPS } from "@/lib/onboarding-create";

export const metadata = funnelPageMetadata("demo");

export default function DemoPage() {
  return (
    <>
      <JsonLd data={fullFunnelPageJsonLd("demo")} />
      <PageHero
        eyebrow="Preview"
        title="Start from your website URL."
        lede="Website path: website URL → check → choose role → configure → review. Not a live number."
      />

      <div className="mx-auto max-w-4xl px-4 pt-6">
        <FunnelPathStrip linked />
      </div>

      <section
        aria-labelledby="demo-timeline-heading"
        className="mx-auto max-w-4xl px-4 pt-6"
      >
        <div className="flex items-center gap-2">
          <h2
            id="demo-timeline-heading"
            className="text-base font-semibold text-ink"
          >
            What the scripted preview does
          </h2>
          <FeatureStatusChip status="UNDER_TEST" />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-3">
            <span className="text-xs font-bold text-accent">STEP 1</span>
            <p className="mt-1 text-xs text-muted">A person describes a repair in the browser preview.</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <span className="text-xs font-bold text-accent">STEP 2</span>
            <p className="mt-1 text-xs text-muted">Server rules evaluate hazards.</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <span className="text-xs font-bold text-accent">STEP 3</span>
            <p className="mt-1 text-xs text-muted">Ticket held for clearance.</p>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted">
          Stages: {CREATE_JOURNEY_STEPS.map((s) => s.label).join(" → ")}.
        </p>
        <p className="mt-1 text-xs text-muted">
          What this is not: Not a live telephone call; does not assign a live number; not an offer for sale; not a booking. Pre-launch synthetic demo.
        </p>
      </section>

      <DemoProof />

      {false && <CtaPair />}
      <section className="mx-auto max-w-4xl px-4 py-12" aria-labelledby="demo-trust-link">
        <h2 id="demo-trust-link" className="sr-only">Related pre-launch pages</h2>
        <p className="text-sm text-muted text-center">
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
          {" "}Also:{" "}
          <a href="/help/" className="font-medium text-accent underline-offset-4 hover:underline">Help</a>
          {" · "}
          <a href="/contact/" className="font-medium text-accent underline-offset-4 hover:underline">Contact</a>
          {" · "}
          <a href="/security/" className="font-medium text-accent underline-offset-4 hover:underline">Security</a>
          . Scripted preview only — not a live support desk.
        </p>
      </section>

      <DeferredDemoConversionTabs />
    </>
  );
}
