import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { industryRoles } from "@/config/industries";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Industries",
  description:
    "Chapelgate industry OS lines for UK property-maintenance firms — emergency triage vs jobs, contractor-dispatch language, out-of-hours honesty, no client-money. Pre-launch, not a generic AI receptionist.",
  path: "/industries/",
});

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Pre-launch · United Kingdom"
        title="One OS per industry."
        lede="Each role is its own product line under Chapelgate Technologies — industry name with OS on the end. Copy is written for UK property-maintenance operations (emergency triage vs jobs, contractor-dispatch language, out-of-hours honesty, no client-money) — not a generic AI receptionist. Pilot-stage — not commercial general availability."
      />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <p className="max-w-3xl text-sm text-muted">
          Pilot-stage. Core controls are real; public always-on phone is not
          declared ready yet. These pages describe intended use for UK
          maintenance firms — not named customer case studies, fabricated
          testimonials, or a Fonio-class “live 24/7 receptionist” claim.
        </p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industryRoles.map((ind) => (
            <li key={ind.slug}>
              <a
                href={`/industries/${ind.slug}/`}
                className="mos-glass block h-full p-5 transition-shadow hover:shadow-[0_0_0_1px_var(--color-accent)]"
              >
                <span className="font-semibold text-ink">{ind.productName}</span>
                <span className="mt-1 block text-xs uppercase tracking-wide text-accent">
                  {ind.label}
                </span>
                <span className="mt-2 block text-sm text-muted">{ind.card}</span>
              </a>
            </li>
          ))}
        </ul>
        <section className="max-w-3xl space-y-4 border-t border-border pt-10">
          <h2 className="text-xl font-semibold text-ink">
            Not sure which OS fits?
          </h2>
          <p className="text-muted">
            Start from your website, join the launch list with your role, or
            request an early-access briefing on what is verified today.
          </p>
          <CtaPair />
        </section>
      </div>
    </>
  );
}
