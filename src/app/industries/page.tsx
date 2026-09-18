import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { industryRoles } from "@/config/industries";

export const metadata = {
  title: "Industries",
  description:
    "Role pages for UK landlords, agents, managers, housing, FM, councils, and holiday lets. Pre-launch.",
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Pre-launch · United Kingdom"
        title="Built around how UK maintenance work actually runs."
        lede="Choose your role. Each page explains the same platform from your operational angle — intake that structures calls, rules that own safety and money boundaries, and humans when decisions matter."
      />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <p className="max-w-3xl text-sm text-muted">
          Pilot-stage. Core controls are real; public always-on phone is not
          declared ready yet. These pages describe intended use — not named
          customer case studies or fabricated testimonials.
        </p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industryRoles.map((ind) => (
            <li key={ind.slug}>
              <a
                href={`/industries/${ind.slug}/`}
                className="block h-full rounded-lg border border-border bg-surface p-5 hover:border-accent"
              >
                <span className="font-semibold text-ink">{ind.label}</span>
                <span className="mt-2 block text-sm text-muted">{ind.card}</span>
              </a>
            </li>
          ))}
        </ul>
        <section className="max-w-3xl space-y-4 border-t border-border pt-10">
          <h2 className="text-xl font-semibold text-ink">
            Not sure which page fits?
          </h2>
          <p className="text-muted">
            Join the launch list with your role, or request an early demo
            briefing on what is verified today.
          </p>
          <CtaPair />
        </section>
      </div>
    </>
  );
}
