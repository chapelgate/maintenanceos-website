import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { industryRoles } from "@/config/industries";
import { JsonLd } from "@/components/JsonLd";
import { contentPageJsonLd } from "@/lib/json-ld";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Repair Intake Software by Sector (UK)",
  description:
    "Repair intake for UK landlords, letting agents, property managers, maintenance firms, housing associations, councils, FM teams and holiday lets.",
  path: "/industries/",
});

const SECTOR_SUMMARIES: Record<string, string> = {
  landlords: "Designed for out-of-hours repair capture with emergency triage — pre-launch preview, not a live phone.",
  "letting-agents": "Triages tenant reports before reaching property managers.",
  "property-managers": "Portfolio repairs structured for contractor handover.",
  "maintenance-companies": "Captures job details without promising false slots.",
  "housing-associations": "Latches emergency hazards for compliance and safety.",
  "facilities-management": "Site maintenance intake with clear human approval.",
  councils: "Statutory repair records with clear officer clearance.",
  "holiday-lets": "Guest issue reporting without false arrival promises.",
};

export default function IndustriesPage() {
  return (
    <>
      <JsonLd
        data={contentPageJsonLd("/industries/", "Repair Intake Software by Sector (UK)", "Repair intake for UK landlords, letting agents, property managers, maintenance firms, housing associations, councils, FM teams and holiday lets.", [
          { name: "Industries", path: "/industries/" },
        ])}
      />
      <PageHero
        eyebrow="Sectors · Pre-launch"
        title="Repair intake for the people who answer for repairs"
        lede="AI assists with intake. Server rules enforce boundaries. Authorised people approve."
      />
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
        <p id="core-safety" className="text-xs text-muted">
          Pre-launch: Core safety controls are built; not a live phone.
        </p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industryRoles.map((ind) => (
            <li key={ind.slug}>
              <a
                href={`/industries/${ind.slug}/`}
                className="group flex h-full flex-col justify-between rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5 transition-all hover:border-accent/40"
              >
                <div>
                  <span className="font-semibold text-ink group-hover:text-accent transition-colors">
                    {ind.label}
                  </span>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {SECTOR_SUMMARIES[ind.slug] || ind.card}
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-accent flex items-center gap-1">
                  View sector →
                </span>
              </a>
            </li>
          ))}
        </ul>
        <section className="max-w-3xl space-y-4 border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-ink">
            UK maintenance — not a generic AI receptionist
          </h2>
          <p className="text-xs text-muted">
            What a public always-on phone is not:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted">
            <li>• <strong>emergency triage vs jobs</strong></li>
            <li>• <strong>contractor-dispatch language</strong></li>
            <li>• <strong>out-of-hours honesty</strong></li>
            <li>• <strong>no client-money</strong></li>
          </ul>
          <p className="text-xs text-muted">
            Read the rules every sector shares on{" "}
            <a href="/how-we-keep-control/" className="text-accent underline">
              How we keep control
            </a>.
          </p>
          <CtaPair />
        </section>
      </div>
    </>
  );
}
