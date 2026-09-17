import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";

export const metadata = { title: "Security" };

export default function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Trust"
        title="Security and accountability by design"
        lede="Tenant isolation, audit evidence, and human clearance for critical safety paths. We do not claim ISO, SOC 2, or other certifications we have not earned."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
        <ul className="list-disc space-y-3 pl-5 text-muted">
          <li>
            <strong className="text-ink">Tenant isolation</strong> — designed so
            one organisation&apos;s data and actions stay within its boundary.
          </li>
          <li>
            <strong className="text-ink">Human clearance</strong> — critical
            safety decisions require a person before consequential action.
          </li>
          <li>
            <strong className="text-ink">Audit-oriented evidence</strong> —
            actions are designed to leave a reviewable trail.
          </li>
          <li>
            <strong className="text-ink">No fake trust theatre</strong> — no
            invented uptime badges, customer logos, or award claims.
          </li>
        </ul>
        <CtaPair
          primaryHref="/demo/"
          primaryLabel="Request early demo"
          secondaryHref="/contact/"
          secondaryLabel="Contact"
        />
      </div>
    </>
  );
}
