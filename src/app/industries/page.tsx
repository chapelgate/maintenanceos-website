import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "Industries",
  description:
    "Role pages for UK landlords, agents, managers, housing, FM, councils, and holiday lets. Pre-launch.",
};

const HONESTY =
  "Pilot-stage. Core controls are real; public always-on phone is not declared ready yet.";

const cards = [
  {
    slug: "landlords",
    label: "Landlords",
    blurb:
      "Catch maintenance reports without inventing jobs or spending authority.",
  },
  {
    slug: "letting-agents",
    label: "Letting agents",
    blurb: "Structured intake across portfolios - rules stay in charge.",
  },
  {
    slug: "property-managers",
    label: "Property managers",
    blurb:
      "Multi-tenant ops: properties, residents, contractors, work orders.",
  },
  {
    slug: "maintenance-companies",
    label: "Maintenance companies",
    blurb: "Cleaner handoffs into jobs and communications - under testing.",
  },
  {
    slug: "housing-associations",
    label: "Housing associations",
    blurb:
      "Safety latch and escalation queues designed for accountable housing ops.",
  },
  {
    slug: "facilities-management",
    label: "Facilities management",
    blurb: "Triage and audit trails for sites that need human clearance.",
  },
  {
    slug: "councils",
    label: "Councils",
    blurb:
      "Controlled intake and oversight language for public-sector maintenance.",
  },
  {
    slug: "holiday-lets",
    label: "Holiday lets",
    blurb:
      "Guest-facing maintenance calls structured without autonomous dispatch.",
  },
] as const;

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Pre-launch · United Kingdom"
        title="Built around how UK maintenance work actually runs."
        lede="Choose your role. Each page explains the same platform from your operational angle - intake that structures calls, rules that own safety and money boundaries, and humans when decisions matter."
      />
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
        <p className="max-w-3xl rounded-md border border-border bg-accent-subtle/60 px-4 py-3 text-sm text-ink">
          {HONESTY}
        </p>

        <CtaPair
          primaryHref="/demo/#launch"
          primaryLabel="Join launch list"
          secondaryHref="/demo/"
          secondaryLabel="Request early demo"
        />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((ind) => (
            <li key={ind.slug}>
              <a
                href={`/industries/${ind.slug}/`}
                className="flex h-full flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent"
              >
                <span className="font-semibold text-ink">{ind.label}</span>
                <span className="mt-2 flex-1 text-sm text-muted">
                  {ind.blurb}
                </span>
                <span className="mt-4 text-sm font-medium text-accent">
                  Role overview
                </span>
              </a>
            </li>
          ))}
        </ul>

        <section
          aria-labelledby="hub-close-heading"
          className="max-w-3xl space-y-4 border-t border-border pt-10"
        >
          <h2
            id="hub-close-heading"
            className="text-2xl font-semibold text-ink"
          >
            Not sure which page fits?
          </h2>
          <p className="text-muted">
            Join the launch list with your role, or request an early demo
            briefing on what's verified today.
          </p>
          <CtaPair
            primaryHref="/demo/#launch"
            primaryLabel="Join launch list"
            secondaryHref="/demo/"
            secondaryLabel="Request early demo"
          />
        </section>
      </div>
    </>
  );
}
