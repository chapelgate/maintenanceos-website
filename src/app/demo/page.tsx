import { DemoConversionTabs } from "@/components/DemoConversionTabs";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Demo & launch list",
  description:
    "Book a MaintenanceOS early access briefing or join the launch list. Pre-launch — not a public live phone line.",
  path: "/demo/",
});

export default function DemoPage() {
  return (
    <>
      <PageHero
        eyebrow="Pre-launch"
        title="See MaintenanceOS the honest way."
        lede="Book a product walkthrough of the maintenance operations platform and receptionist architecture. This is an early access briefing — not a public live phone line."
      />
      <section className="mx-auto max-w-3xl px-4 pt-10">
        <h2 className="text-lg font-semibold text-ink">What you get</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
          <li>
            Walkthrough of multi-tenant maintenance operations (properties, work
            orders, contractors, audit and evidence primitives).
          </li>
          <li>
            Clear explanation of AI intake versus deterministic safety and
            financial prohibitions.
          </li>
          <li>
            Pre-launch candour: what is verified today versus still gated
            (including controlled-call status).
          </li>
        </ul>
        <h2 className="mt-8 text-lg font-semibold text-ink">What this is not</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
          <li>Not a self-serve “call our AI now” public demo.</li>
          <li>Not a production telephony GO.</li>
          <li>Not a promise of autonomous job booking or payments.</li>
        </ul>
      </section>
      {/* launch_list + early_demo both render LeadCaptureForm inside DemoConversionTabs. */}
      <DemoConversionTabs />
    </>
  );
}
