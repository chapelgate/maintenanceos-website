import type { Metadata } from "next";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = contentPageMetadata({
  title: "Contact",
  description:
    "Questions about MaintenanceOS, early access or the pilot partner programme? A person will reply.",
  path: "/contact/",
});

const PATHS = [
  {
    href: "/demo/",
    label: "Request an early demo",
    body: "See the rules working on a sample repair. The primary product path.",
  },
  {
    href: "/how-we-keep-control/",
    label: "See the safety rules",
    body: "Read how we separate critical cases from routine jobs.",
  },
  {
    href: "/demo/#launch",
    label: "Join launch list",
    body: "Email updates when we open access. No fake urgency.",
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="United Kingdom · Pre-launch"
        title="Talk to a person"
        lede="Genuine human enquiries about MaintenanceOS. Product interest starts at Request an early demo. Launch-list and early-access briefings live on /demo. Not live phone provisioning, not a GA support desk, and no invented response SLA."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
        <FunnelPathStrip linked />

        <section aria-labelledby="contact-paths-heading">
          <h2
            id="contact-paths-heading"
            className="text-lg font-semibold text-ink"
          >
            Choose the right path
          </h2>
          <p className="mt-2 text-sm text-muted">
            Not sure which form to use? Start with product interest, then a
            briefing if you want a person.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {PATHS.map((path) => (
              <li key={path.href}>
                <a
                  href={path.href}
                  className="mos-glass contact-path-card transition-shadow hover:shadow-[0_0_0_1px_var(--color-accent)]"
                >
                  <span className="font-semibold text-accent">{path.label}</span>
                  <span className="mt-2 block text-sm text-muted">
                    {path.body}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Product interest starts at{" "}
            <a href="/demo/" className="text-accent underline">
              Request an early demo
            </a>
            . This page — genuine human enquiries / early access. Not a support
            desk, not live phone provisioning, no invented SLA.
          </p>
        </section>

        {/* contact lead_type — same LeadCaptureForm as launch_list / early_demo. */}
        <LeadCaptureForm
          leadType="contact"
          title="Send a message"
          helper="Human enquiry only — not a GA support desk, not live number provisioning, and no promised response time."
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
        <p className="text-xs text-muted">
          No support-desk hours. No live phone. No invented SLA.
        </p>
      </div>
    </>
  );
}
