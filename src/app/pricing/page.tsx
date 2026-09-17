import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Launching soon"
        title="Pricing"
        lede="Public list pricing is not published yet. Request pricing or an early demo while we prepare launch."
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-lg font-semibold text-ink">Request pricing</p>
          <p className="mt-2 text-muted">
            MaintenanceOS is pre-launch. We will share packages suited to UK
            landlords, letting agents, and property managers when early access
            opens — no self-serve checkout on this site.
          </p>
          <CtaPair
            className="mt-8 justify-center"
            primaryHref="/demo/"
            primaryLabel="Request early demo"
            secondaryHref="/demo/#launch"
            secondaryLabel="Join launch list"
          />
        </div>
      </div>
    </>
  );
}
