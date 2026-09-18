import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";

export type IndustryStubPageProps = {
  title: string;
  lede: string;
  job: string[];
  fit: string[];
  safety: string;
  antiClaims: string;
};

const HONESTY =
  "Pilot-stage. Core controls are real; public always-on phone is not declared ready yet.";

export function IndustryStubPage({
  title,
  lede,
  job,
  fit,
  safety,
  antiClaims,
}: IndustryStubPageProps) {
  return (
    <>
      <PageHero eyebrow="Industries" title={title} lede={lede} />
      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12">
        <p className="rounded-md border border-border bg-accent-subtle/60 px-4 py-3 text-sm text-ink">
          {HONESTY}
        </p>

        <CtaPair
          primaryHref="/demo/"
          primaryLabel="Request early demo"
          secondaryHref="/demo/#launch"
          secondaryLabel="Join launch list"
        />

        <section aria-labelledby="job-heading" className="space-y-4">
          <h2 id="job-heading" className="text-xl font-semibold text-ink">
            The job you are doing
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-muted">
            {job.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="fit-heading" className="space-y-4">
          <h2 id="fit-heading" className="text-xl font-semibold text-ink">
            How MaintenanceOS fits
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-muted">
            {fit.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="safety-heading"
          className="rounded-lg border border-border bg-surface p-6"
        >
          <h2 id="safety-heading" className="text-xl font-semibold text-ink">
            Safety &amp; money boundaries
          </h2>
          <p className="mt-3 text-muted">{safety}</p>
          <p className="mt-4 text-sm text-muted">
            Trust and clearance:{" "}
            <a href="/security/" className="font-medium text-accent underline">
              Security
            </a>
            .
          </p>
        </section>

        <section aria-labelledby="anti-heading" className="space-y-4">
          <h2 id="anti-heading" className="text-xl font-semibold text-ink">
            What we will not claim
          </h2>
          <p className="text-muted">{antiClaims}</p>
        </section>

        <section
          aria-labelledby="close-heading"
          className="space-y-4 border-t border-border pt-10"
        >
          <h2 id="close-heading" className="text-xl font-semibold text-ink">
            Next step
          </h2>
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
