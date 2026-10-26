import { getAllComparisonSlugs, getComparisonBySlug } from "@/lib/compare";
import { contentPageMetadata } from "@/lib/page-meta";
import { contentPageJsonLd } from "@/lib/json-ld";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import Link from "next/link";

export const metadata = contentPageMetadata({
  title: "Compare Alternatives",
  description: "Compare WorkSmartOS MaintenanceOS with other property maintenance software and AI receptionist services. Verifiable facts only — no invented claims.",
  path: "/compare/",
});

export default function CompareIndexPage() {
  const slugs = getAllComparisonSlugs();
  const comparisons = slugs
    .map((slug) => getComparisonBySlug(slug))
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <>
      <JsonLd
        data={contentPageJsonLd(
          "/compare/",
          "Compare Alternatives",
          "Compare WorkSmartOS MaintenanceOS with other property maintenance software and AI receptionist services. Verifiable facts only — no invented claims.",
          [{ name: "Compare Alternatives", path: "/compare/" }],
        )}
      />
      <PageHero
        eyebrow="Comparison"
        title="Compare Alternatives"
        lede="Side-by-side comparisons with verifiable facts. No invented metrics, customers, certifications, or prices. Every competitor claim is sourced from public pages."
      />

      <section className="mx-auto max-w-4xl space-y-8 px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {comparisons.map(({ frontmatter }) => (
            <article
              key={frontmatter.slug}
              className="rounded-[var(--mos-radius-lg)] border border-border bg-surface p-5 space-y-3 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    {frontmatter.category}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-ink">
                    WorkSmartOS vs {frontmatter.competitorName}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-muted line-clamp-2">{frontmatter.tagline}</p>
              <Link
                href={`/compare/worksmartos-vs-${frontmatter.slug}/`}
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                View comparison
              </Link>
            </article>
          ))}
        </div>

        <section aria-labelledby="methodology" className="border-t border-border pt-8">
          <h2 id="methodology" className="text-xl font-semibold text-ink">
            Our comparison methodology
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-muted list-disc list-inside">
            <li>
              <strong>Verifiable claims only:</strong> Every competitor fact is sourced from a public URL with an access date.
            </li>
            <li>
              <strong>No invented data:</strong> No fabricated metrics, customer counts, certifications, awards, testimonials, or prices.
            </li>
            <li>
              <strong>WorkSmartOS claims reflect pre-launch status:</strong> MaintenanceOS is pre-launch, not commercially generally available. No live phone in a plan. Early access only.
            </li>
            <li>
              <strong>Claims-safe language:</strong> We distinguish between what a product does today vs. what is marketed. &ldquo;AI receptionist&rdquo; capabilities are described as stated by the provider.
            </li>
            <li>
              <strong>Sources cited:</strong> Each comparison page includes a Sources section with numbered citations linking to the original public pages.
            </li>
          </ul>
        </section>

        <section aria-labelledby="disclaimer" className="border-t border-border pt-8">
          <h2 id="disclaimer" className="text-xl font-semibold text-ink">
            Disclaimer
          </h2>
          <p className="mt-2 text-sm text-muted">
            Pre-launch. Informational purposes only — not an offer to sell, book, or buy WorkSmartOS or MaintenanceOS. Comparisons are based on publicly available information as of the access dates shown on each page. Competitor products and pricing may change. We do not guarantee the accuracy of third-party information. WorkSmartOS and MaintenanceOS are products of Chapelgate Limited (company number 12340004). This comparison does not constitute legal or financial advice.
          </p>
        </section>
      </section>
    </>
  );
}