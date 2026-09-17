import { CtaPair } from "@/components/CtaPair";
import { PageHero } from "@/components/PageHero";
import { industries } from "@/config/site";

export const metadata = { title: "Industries" };

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        title="Built for UK maintenance operations"
        lede="Choose your role. These pages describe intended use — not named customer case studies or fabricated testimonials."
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((ind) => (
            <li key={ind.slug}>
              <a
                href={`/industries/${ind.slug}/`}
                className="block rounded-lg border border-border bg-surface p-5 hover:border-accent"
              >
                <span className="font-semibold text-ink">{ind.label}</span>
                <span className="mt-1 block text-sm text-muted">
                  Role overview →
                </span>
              </a>
            </li>
          ))}
        </ul>
        <CtaPair className="mt-12" />
      </div>
    </>
  );
}
