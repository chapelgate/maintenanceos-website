import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { PreLaunchRecoveryNav } from "@/components/PreLaunchRecoveryNav";

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
            website setup preview
          </a>
          .
        </p>
        <CtaPair
          primaryHref="/demo/"
          primaryLabel="Request an early demo"
          secondaryHref="/how-we-keep-control/"
          secondaryLabel="See the safety rules"
        />
        <PreLaunchRecoveryNav
          links={[
            { href: "/industries/", label: "All sectors" },
            { href: "/help/", label: "Help" },
            { href: "/security/", label: "Security" },
            { href: "/contact/", label: "Contact" },
          ]}
          note="Sector page only — not a live industry support desk, and not a live phone."
        />
      </div>
    </>
  );
}
