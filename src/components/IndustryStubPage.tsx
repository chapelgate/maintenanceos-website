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
        lede={`${audience} MaintenanceOS is designed to keep intake, triage, and contractor coordination accountable — under testing, not commercially GA.`}
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
          . Ready to talk?{" "}
          <a href="/demo/" className="text-accent underline">
            Request early demo
          </a>
          .
        </p>
        <CtaPair />
      </div>
    </>
  );
}
