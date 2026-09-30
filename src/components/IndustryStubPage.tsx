import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";

type IndustryStubPageProps = {
  title: string;
  audience: string;
  focus: string[];
};

export function IndustryStubPage({
  title,
  audience,
  focus,
}: IndustryStubPageProps) {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title={title}
        lede={`${audience} MaintenanceOS is designed to keep intake, triage, and contractor coordination accountable — in preview, not commercially GA.`}
      />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <h2 className="text-xl font-semibold text-ink">Focus areas</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted">
          {focus.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-sm text-muted">
          Trust and clearance:{" "}
          <a href="/security/" className="text-accent underline">
            Security
          </a>
          . Start from a website URL:{" "}
          <a href="/create/" className="text-accent underline">
            Create from website
          </a>
          .
        </p>
        <CtaPair
          primaryHref="/create/"
          primaryLabel="Create from website"
          secondaryHref="/demo/#demo"
          secondaryLabel="Request early access"
        />
      </div>
    </>
  );
}
