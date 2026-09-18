import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import type { IndustryRole } from "@/config/industries";

const honesty =
  "Pilot-stage. Core controls are real; public always-on phone is not declared ready yet.";

type Props = { role: IndustryRole };

export function IndustryRolePage({ role }: Props) {
  return (
    <>
      <PageHero eyebrow="Industries" title={role.title} lede={role.sub} />
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
        <p className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-muted">
          {honesty}
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">The job you are doing</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted">
            {role.job.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">How MaintenanceOS fits</h2>
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
            primaryHref="/demo/"
            primaryLabel="Request early demo"
            secondaryHref="/demo/#launch"
            secondaryLabel="Join launch list"
          />
          <p className="text-sm text-muted">
            <a href="/industries/" className="text-accent underline">
              All industries
            </a>
          </p>
        </section>
      </div>
    </>
  );
}
