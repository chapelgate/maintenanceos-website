import { CtaPair } from "@/components/CtaPair";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { SafeAutomationModel } from "@/components/SafeAutomationModel";
import { industryRoles } from "@/config/industries";
import { funnelPageJsonLd } from "@/lib/json-ld";
import { funnelPageMetadata } from "@/lib/page-meta";

export const metadata = funnelPageMetadata("propertyMaintenanceSoftware");

export default function PropertyMaintenanceSoftwarePage() {
  return (
    <>
      <JsonLd data={funnelPageJsonLd("propertyMaintenanceSoftware")} />
      <PageHero
        eyebrow="United Kingdom · Pre-launch"
        title="Property maintenance software for UK teams."
        lede="MaintenanceOS by Chapelgate is pre-launch property maintenance operations software for landlords, letting agents, property managers, maintenance firms, housing providers, facilities teams, councils, and holiday-let operators. AI assists intake; deterministic rules and authorised people retain control of safety, dispatch, and money."
        orbAccent
      />
      <SafeAutomationModel compact />
      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-ink">What property maintenance software means here</h2>
          <p className="text-muted">
            MaintenanceOS is focused on the operational path around a repair or maintenance report:
            capture the issue, preserve who/what/where/access details, separate emergency guidance
            from routine jobs, and prepare structured information for human-controlled follow-up.
            It is not marketed as a full property-accounting suite, tenancy CRM, CAFM replacement,
            contractor marketplace, or autonomous dispatch system.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Maintenance management without invented commitments</h2>
          <p className="text-muted">
            The product model includes properties, residents, contractors, work orders, jobs, and
            communications. AI-assisted intake is under testing. Deterministic server rules own
            lifecycle, safety boundaries, and prohibited money actions. The system must not invent
            a booking, engineer visit, refund, safety assurance, or “someone is on the way”.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Built around UK maintenance roles</h2>
          <p className="text-muted">Choose the role closest to your operation. Each page describes a different buyer problem rather than repeating the same generic software copy.</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {industryRoles.map((role) => (
              <li key={role.slug}>
                <a href={`/industries/${role.slug}/`} className="mos-glass block h-full p-4 text-sm text-ink hover:underline">
                  <strong>{role.label}</strong>
                  <span className="mt-1 block text-muted">{role.card}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Current pre-launch path</h2>
          <p className="text-muted">Website → Check → Choose → Configure → Review & Pack → optional sandbox → early access. The public website does not provision a live phone number and does not claim general availability.</p>
          <p className="text-muted">
            For the AI-assisted call-intake layer specifically, see{" "}
            <a href="/ai-receptionist/" className="text-accent underline">AI receptionist for maintenance intake</a>.
          </p>
        </section>
        <section className="space-y-4 border-t border-border pt-8">
          <h2 className="text-2xl font-semibold text-ink">Evaluate the workflow</h2>
          <p className="text-muted">Start from your public business website or request a human early-access briefing.</p>
          <CtaPair />
        </section>
      </div>
    </>
  );
}
