import type { Metadata } from "next";
import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = contentPageMetadata({
  title: "FAQ",
  description:
    "Straight answers on MaintenanceOS readiness, AI authority, emergency guidance, and pricing — aligned with our product claims register. Pre-launch.",
  path: "/faq/",
});

/** Claims-safe stubs only. Expand only after Claims Verifier / Copy sign-off. */
const faqs = [
  {
    q: "Is MaintenanceOS commercially available now?",
    a: "No. The website is in pre-launch / early-access mode. Join the launch list or request an early demo.",
  },
  {
    q: "Does AI make final safety or money decisions?",
    a: "No. Deterministic safety rules override AI. Critical safety paths require human clearance. AI has no payment, refund, or client-money authority.",
  },
  {
    q: "Is the AI receptionist live for production calls?",
    a: (
      <>
        It is under testing and in development. Prior validation calls have
        occurred; we do not claim commercial GA or invent concurrent capacity
        numbers. See{" "}
        <a href="/ai-receptionist/" className="text-accent underline">
          AI receptionist
        </a>
        .
      </>
    ),
  },
  {
    q: "What about emergency guidance?",
    a: "Product design uses UK terminology and 999 guidance (not 911). Live-carrier retesting remains part of release readiness.",
  },
  {
    q: "When will pricing be published?",
    a: (
      <>
        Pricing is launching soon. Request pricing via an{" "}
        <a href="/demo/" className="text-accent underline">
          early demo
        </a>{" "}
        while packages are prepared.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        title="Frequently asked questions"
        lede="Straight answers aligned with our product claims register. No marketing spin on readiness."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <div className="space-y-4">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="rounded-md border border-border bg-surface p-4"
            >
              <summary className="cursor-pointer font-semibold text-ink">
                {item.q}
              </summary>
              <p className="mt-3 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
        <CtaPair className="pt-4" />
      </div>
    </>
  );
}
