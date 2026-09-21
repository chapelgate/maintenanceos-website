import type { Metadata } from "next";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = contentPageMetadata({
  title: "Contact",
  description:
    "General enquiries about MaintenanceOS. The public path is /create. Launch-list and early-access briefing forms live on /demo. Pre-launch — not a live phone.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact"
        lede="General enquiries about MaintenanceOS. Prefer Create from website for the public path, or /demo for launch-list signup and an early-access briefing."
      />
      <div className="mx-auto max-w-xl space-y-8 px-4 py-12">
        <aside className="rounded-md border border-border bg-surface p-4 text-sm text-muted">
          <p className="font-medium text-ink">Not sure which form to use?</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <a href="/create/" className="text-accent underline">
                Create from website
              </a>{" "}
              — website URL → check → review → pack → early access
            </li>
            <li>
              <a href="/demo/#launch" className="text-accent underline">
                Join launch list
              </a>{" "}
              — email updates when we open access
            </li>
            <li>
              <a href="/demo/#demo" className="text-accent underline">
                Request early access
              </a>{" "}
              — a human briefing, not a live phone number
            </li>
            <li>
              This page — anything else that is not create, briefing, or
              launch-list signup
            </li>
          </ul>
        </aside>

        {/* contact lead_type — same LeadCaptureForm as launch_list / early_demo. */}
        <LeadCaptureForm
          leadType="contact"
          title="Send a message"
          submitLabel="Send enquiry"
          showMessage
        />

        <p className="text-sm text-muted">
          Looking for product depth first? See{" "}
          <a href="/how-it-works/" className="text-accent underline">
            how it works
          </a>{" "}
          or{" "}
          <a href="/faq/" className="text-accent underline">
            FAQ
          </a>
          .
        </p>
      </div>
    </>
  );
}
