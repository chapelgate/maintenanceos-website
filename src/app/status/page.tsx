import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = {
  ...contentPageMetadata({
    title: "Status",
    description:
      "MaintenanceOS is pre-launch. There's no public production service yet, so no live status or uptime figures are shown here.",
    path: "/status/",
  }),
  robots: { index: false, follow: false },
};

export default function StatusPage() {
  return (
    <>
      <PageHero
        eyebrow="Placeholder"
        title="Service status"
        lede="This page is a placeholder. It is not a live status page and does not publish an uptime figure."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 text-muted">
        <p>
          When MaintenanceOS publishes a real status page, it will report
          verified component health from monitored systems — not invented
          percentages. This page describes how a future public status surface
          would work; it does not show live uptime metrics.
        </p>
        <p>
          Machine-readable status:{" "}
          <a
            href="/status.json"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            /status.json
          </a>{" "}
          sets live false, sla_claim false, commercial_ga false, live_phone false, and uptime_percent null. It does
          not publish an SLA or an uptime figure.
        </p>
        <section aria-labelledby="status-components">
          <h2
            id="status-components"
            className="text-lg font-semibold text-ink"
          >
            Components a future status page would cover
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Marketing site static hosting (this site)</li>
            <li>Lead-capture adapter / form endpoint (when configured)</li>
            <li>
              Product API and voice runtime (internal; not linked from
              marketing until authorised)
            </li>
          </ul>
        </section>
        <p className="mos-glass border-dashed p-4 text-sm">
          No fake uptime charts, incident timelines, or SLA badges are shown
          here. Metrics appear only when wired to real monitors. The website
          scanner remains frozen (t835u) and is not a monitored component here.
        </p>
        <p className="text-sm text-muted">
          Related pre-launch pages:{" "}
          <a
            href="/trust/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Trust
          </a>
          {" · "}
          <a
            href="/security/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Security
          </a>
          {" · "}
          <a
            href="/help/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Help
          </a>
          {" · "}
          <a
            href="/contact/"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Contact
          </a>
          . These are documentation surfaces — not a live ops desk.
        </p>
      </div>
    </>
  );
}
