import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = contentPageMetadata({
  title: "Status",
  description:
    "Architecture placeholder for a future MaintenanceOS public status surface. No live uptime metrics are shown here.",
  path: "/status/",
});

export default function StatusPage() {
  return (
    <>
      <PageHero
        eyebrow="Placeholder"
        title="Status architecture"
        lede="This page describes how a future public status surface would work. It does not show live uptime metrics."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 text-muted">
        <p>
          When MaintenanceOS publishes a real status page, it will report
          verified component health from monitored systems — not invented
          percentages.
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
          here. Metrics appear only when wired to real monitors.
        </p>
      </div>
    </>
  );
}
