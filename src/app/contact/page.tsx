import type { Metadata } from "next";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = contentPageMetadata({
  title: "Contact",
  description:
    "Direct enquiries about MaintenanceOS. A person will reply. Pre-launch.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Pre-launch"
        title="Talk to a person"
        lede="Direct enquiries about MaintenanceOS. Not live phone provisioning, not a GA support desk, and no invented response SLA."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <FunnelPathStrip linked />

        <div className="rounded-[var(--mos-radius-lg)] border border-border bg-surface p-6 space-y-4">
          <h2 className="text-lg font-semibold text-ink">Choose the right path</h2>
          <p className="text-xs text-muted">
            For early access, visit <a href="/demo/" className="text-accent underline">Request an early demo</a>. For direct general questions, email our founder.
          </p>
          <div className="rounded-lg border border-border bg-paper/50 p-4">
            <p className="text-xs font-medium text-muted">Direct email</p>
            <a
              href="mailto:info@chapelgatetechnologies.com"
              className="text-sm font-semibold text-accent underline"
            >
              info@chapelgatetechnologies.com
            </a>
            <p className="mt-1 text-xs text-muted">
              Expected response turnaround: business hours. No invented response SLA.
            </p>
          </div>
        </div>

        <LeadCaptureForm
          leadType="contact"
          title="Send a message"
          helper="Human enquiry only — not live phone provisioning, not a GA support desk, and no invented response SLA."
          submitLabel="Send enquiry"
        />
      </div>
    </>
  );
}
