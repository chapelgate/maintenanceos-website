import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { industryRoles } from "@/config/industries";
import { contentPageMetadata } from "@/lib/page-meta";

export const metadata = contentPageMetadata({
  title: "Repair Intake Software by Sector (UK)",
  description:
    "Repair intake for UK landlords, letting agents, property managers, maintenance firms, housing associations, councils, FM teams and holiday lets.",
  path: "/industries/",
});

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Pre-launch: MaintenanceOS is still under testing, and we're taking early-access requests."
        title="Repair intake for the people who answer for repairs"
        lede="Whoever you are, the rules are the same: the AI takes the details, fixed rules decide what happens next, and a person still clears anything flagged as dangerous. What changes is who's calling and what you need to show afterwards."
        orbAccent
      />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industryRoles.map((ind) => (
            <li key={ind.slug}>
              <a
                href={`/industries/${ind.slug}/`}
                className="mos-glass flex flex-col h-full p-5 transition-shadow hover:shadow-[0_0_0_1px_var(--color-accent)]"
              >
                <span className="font-semibold text-ink">{ind.label}</span>
                <span className="mt-2 block text-sm text-muted flex-grow">{ind.title}</span>
              </a>
            </li>
          ))}
        </ul>
        <section className="max-w-3xl space-y-6 border-t border-border pt-10">
          <h2 className="text-xl font-semibold text-ink">
            UK maintenance — not a generic AI receptionist
          </h2>
          <p className="text-muted">
            What a public always-on phone is not:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted text-sm">
            <li><strong>emergency triage vs jobs:</strong> UK/999 guidance is locked in product source.</li>
            <li><strong>contractor-dispatch language:</strong> rules must not invent a van or slot.</li>
            <li><strong>out-of-hours honesty:</strong> designed to collect caller details when the desk is closed.</li>
            <li><strong>no client-money:</strong> no payment, refund, compensation, or fee-waiver authority.</li>
          </ul>
          <p className="text-muted">
            Read the rules every sector shares on <a href="/how-we-keep-control/" className="text-accent underline">How we keep control</a>.
          </p>
          <CtaPair />
        </section>
      </div>
    </>
  );
}
