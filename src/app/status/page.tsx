import { PageHero } from "@/components/PageHero";

export const metadata = { title: "Status" };

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
        <ul className="list-disc space-y-2 pl-5">
          <li>Marketing site static hosting (this site)</li>
          <li>Lead-capture adapter / form endpoint (when configured)</li>
          <li>Product API and voice runtime (internal; not linked from marketing until authorised)</li>
        </ul>
        <p className="rounded-md border border-dashed border-border bg-surface p-4 text-sm">
          No fake uptime charts, incident timelines, or SLA badges are shown
          here. Metrics appear only when wired to real monitors.
        </p>
      </div>
    </>
  );
}
