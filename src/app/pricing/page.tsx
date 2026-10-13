import { CtaPair } from "@/components/CtaPair";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { PageHero } from "@/components/PageHero";
import { getPricingConfig } from "@/config/pricing";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Pricing",
  description:
    "List prices are not published yet. Request an early demo to talk through pricing. Pre-launch, not a live phone.",
  path: "/pricing/",
});

const designedToInclude = [
  "Website Intake: Captures repair facts in natural UK terminology.",
  "Fixed Safety Latches: Rules hold critical hazards for human clearance.",
  "Audit Evidence: Full activity logs without client-money authority.",
] as const;

const notSoldAsLive = [
  "No live phone in a plan (not a live public phone)",
  "No self-serve checkout and no invented list prices",
  "Calendar booking: coming / early access — not general availability",
] as const;

export default function PricingPage() {
  const pricing = getPricingConfig();

  return (
    <>
      <PageHero
        eyebrow={pricing.eyebrow || undefined}
        title={pricing.title}
        lede="Early access status: packages are shared on request. No live phone in a plan."
        orbAccent
      />
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
        <FunnelPathStrip linked />

        <div className="rounded-[var(--mos-radius-lg)] border border-border bg-surface p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            Pre-launch
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ink">
            Request pricing
          </h2>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            Early access preview for UK property operations. Request pricing to discuss packages for your portfolio.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="/demo/"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
            >
              Request an early demo
            </a>
            <a
              href="/how-we-keep-control/"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent"
            >
              See the safety rules
            </a>
          </div>
          <div className="hidden">
            <CtaPair />
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5 space-y-3">
            <h2 className="text-base font-semibold text-ink">
              Designed to include
            </h2>
            <ul className="space-y-2 text-xs text-muted">
              {designedToInclude.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5 space-y-3">
            <h2 className="text-base font-semibold text-ink">
              Not sold as live yet
            </h2>
            <ul className="space-y-2 text-xs text-muted">
              {notSoldAsLive.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
