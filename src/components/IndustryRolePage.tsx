import { CtaPair } from "@/components/CtaPair";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import {
  ukMaintenanceVsGeneric,
  type IndustryRole,
} from "@/config/industries";
import { getIndustrySeoIntent } from "@/config/seo-intents";
import { industryPageJsonLd } from "@/lib/json-ld";

const honesty =
  "Pilot-stage. Core controls are real; public always-on phone is not declared ready yet.";

type Props = { role: IndustryRole };

export function IndustryRolePage({ role }: Props) {
  const seo = getIndustrySeoIntent(role.slug);
  return (
    <>
      <JsonLd data={industryPageJsonLd(role.slug)} />
      <PageHero
        eyebrow={`${role.productName} · Industries`}
        title={role.title}
        lede={role.sub}
      />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
        <p className="mos-glass px-4 py-3 text-sm text-muted">
          {honesty} Product line: <strong className="text-ink">{role.productName}</strong>{" "}
          under Chapelgate.
        </p>

        {seo ? (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-ink">{seo.title}</h2>
            <p className="text-muted">{seo.summary}</p>
            <p className="text-sm text-muted">
              Core category:{" "}
              <a href="/property-maintenance-software/" className="text-accent underline">
                property maintenance software
              </a>
              .
            </p>
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">
            UK maintenance — not a generic AI receptionist
          </h2>
          <p className="text-muted">
            Generic receptionist tools answer phones. {role.productName} is
            written for UK property-maintenance operations. Positioning only —
            voice remains under testing; not commercial general availability.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-muted">
            {ukMaintenanceVsGeneric.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">The job you are doing</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted">
            {role.job.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">
            How {role.productName} fits
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-muted">
            {role.fits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">Safety and money boundaries</h2>
          <p className="text-muted">{role.safety}</p>
          <p className="text-sm text-muted">
            Trust and clearance:{" "}
            <a href="/security/" className="text-accent underline">
              Security
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">What we will not claim</h2>
          <p className="text-muted">{role.willNotClaim}</p>
        </section>

        <section className="space-y-4 border-t border-border pt-8">
          <CtaPair
            primaryHref="/create/"
            primaryLabel="Create from website"
            secondaryHref="/demo/#demo"
            secondaryLabel="Request early access"
          />
          <p className="text-sm text-muted">
            <a href="/industries/" className="text-accent underline">
              All industry OS lines
            </a>
          </p>
        </section>
      </div>
    </>
  );
}
