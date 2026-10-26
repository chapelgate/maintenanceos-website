import type { Metadata } from "next";
import { Accordion } from "@/components/Accordion";
import { CtaPair } from "@/components/CtaPair";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { SafeAutomationModel } from "@/components/SafeAutomationModel";
import { contentPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = contentPageMetadata({
  title: "The safety rules, written down",
  description:
    "AI assists with intake. Fixed server rules control the lifecycle. Authorised people clear dangerous repairs.",
  path: "/how-we-keep-control/",
});

export default function HowWeKeepControlPage() {
  return (
    <>
      <JsonLd
        data={contentPageJsonLd("/how-we-keep-control/", "The safety rules, written down", "AI assists with intake. Fixed server rules control the lifecycle. Authorised people clear dangerous repairs.", [
          { name: "How We Keep Control", path: "/how-we-keep-control/" },
        ])}
      />
      <PageHero
        eyebrow="Pre-launch · Preview"
        title="The safety rules, written down."
        lede="AI assists with intake. Fixed server rules control the lifecycle. Authorised people clear dangerous repairs."
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-12">
        {/* Emergency Callout immediately at the top of content */}
        <section
          id="gas"
          aria-labelledby="gas-heading"
          className="mos-emergency-banner rounded-[var(--mos-radius-lg)] border-2 border-red-500/40 bg-red-500/10 p-5 text-ink"
        >
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 text-red-500 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h2 id="gas-heading" className="font-semibold text-base sm:text-lg text-ink">
                If you smell gas right now or suspect carbon monoxide
              </h2>
              <p className="mt-1 text-sm text-muted">
                Get into fresh air immediately. Do not touch electrical switches or ignite flames.
              </p>
              <p className="mt-2 text-xs text-muted">
                <strong>Carbon monoxide: know the signs.</strong> Headaches, nausea, dizziness, breathlessness, collapse. If you suspect it: turn off the appliance if it&apos;s safe to, open doors and windows, go outside, and call the National Gas Emergency Service on 0800 111 999. Don&apos;t go back inside until you&apos;ve been told it&apos;s safe. Call NHS 111 for medical advice, or 999 if someone is finding it hard to breathe, has suddenly become confused or has lost consciousness.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <a
                  href="tel:0800111999"
                  className="inline-flex min-h-11 items-center justify-center rounded bg-red-600 px-3.5 py-2 text-white hover:bg-red-700"
                >
                  Gas Emergency (GB): 0800 111 999
                </a>
                <a
                  href="tel:0800002001"
                  className="inline-flex min-h-11 items-center justify-center rounded border border-border bg-surface px-3.5 py-2 text-ink hover:border-accent"
                >
                  Gas Emergency (NI): 0800 002 001
                </a>
                <a
                  href="tel:999"
                  className="inline-flex min-h-11 items-center justify-center rounded border border-border bg-surface px-3.5 py-2 text-ink hover:border-accent"
                >
                  Danger to life: Call 999
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* The 3 Core Pillars & Never Invent Rulebook */}
        <SafeAutomationModel />

        {/* Deep Details (4 Progressive Disclosure Accordions) */}
        <section aria-labelledby="deep-details-heading" className="space-y-4">
          <div className="max-w-2xl mb-6">
            <h2 id="deep-details-heading" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Deep details &amp; technical boundaries
            </h2>
            <p className="mt-2 text-sm text-muted">
              Operational rules, statutory records, and continuous verification.
            </p>
          </div>

          <div className="space-y-3">
            <Accordion summary="How the critical safety latch works">
              <p>
                When an intake report indicates hazards to life or property—such as gas, electrical sparking, or severe leaks—the server applies an immutable latch.
              </p>
              <p>
                This latch halts automated transitions and requires an authorised human supervisor to review and explicitly clear the ticket before contractor dispatch.
              </p>
            </Accordion>

            <Accordion summary="Auditable evidence and job records">
              <p>
                Product design intent: caller interaction, transcription extract, hazard detection score, and staff clearance decision are logged with timestamps in the MaintenanceOS product path.
              </p>
              <p>
                That design aims for auditable evidence for statutory and Housing Ombudsman review. This marketing site does not itself operate live call logging or claim a live production evidence store.
              </p>
            </Accordion>

            <Accordion summary="Tenant isolation and multi-organisation data controls">
              <p>
                Product design intent: organisation data is partitioned by organisation ID at the database layer so cross-organisation leakage is not permitted in the product path.
              </p>
              <p>
                Targeted product regressions are intended to enforce that partitioning on product release builds. This marketing site does not host multi-tenant customer data.
              </p>
            </Accordion>

            <Accordion summary="Checkpoint test verification (196 automated test suite)">
              <p>
                Every deployment must pass 196 automated safety and claims verification tests before shipping.
              </p>
              <p>
                Tests verify that safety latches fail closed, payment operations remain prohibited, and emergency routing cannot be bypassed.
              </p>
            </Accordion>
          </div>
        </section>

        {/* Closing CTA */}
        <div className="pt-6">
          <CtaPair primaryHref="/demo/" primaryLabel="Request an early demo" />
        </div>
      </div>
    </>
  );
}
