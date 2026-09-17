import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About MaintenanceOS"
        lede="We are building operations software so UK property maintenance stays clear, accountable, and in control — a maintenance department as a service mindset for landlords, letting agents, and property managers."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 text-muted">
        <p>
          Chapelgate is developing MaintenanceOS with an emphasis on
          deterministic safety rules, human clearance for critical decisions,
          and AI that assists without holding final authority on safety or
          money.
        </p>
        <p>
          This marketing site is pre-launch. We do not invent team bios,
          customer logos, or certifications. Product evidence lives in the
          internal pilot programme — not on fabricated public dashboards.
        </p>
        <CtaPair />
      </div>
    </>
  );
}
