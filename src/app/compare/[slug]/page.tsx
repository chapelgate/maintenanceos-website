import { notFound } from "next/navigation";
import { getComparisonBySlug, getAllComparisonSlugs, getLegacyComparisonSlugs, generateComparisonMetadata } from "@/lib/compare";
import { contentPageMetadata } from "@/lib/page-meta";
import { contentPageJsonLd } from "@/lib/json-ld";
import { JsonLd } from "@/components/JsonLd";
import { markdownToHtml } from "@/lib/markdown-to-html";
import { PageHero } from "@/components/PageHero";
import { PreLaunchRecoveryNav } from "@/components/PreLaunchRecoveryNav";
import { redirectScript } from "@/lib/inline-script";

interface ComparePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const newSlugs = getAllComparisonSlugs();
  const legacySlugs = getLegacyComparisonSlugs();
  return [...newSlugs, ...legacySlugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ComparePageProps) {
  const resolvedParams = await params;
  const data = getComparisonBySlug(resolvedParams.slug);

  if (!data) {
    return contentPageMetadata({
      title: "Comparison Not Found",
      description: "The requested comparison page does not exist.",
      path: "/404",
    });
  }

  const meta = generateComparisonMetadata(data);
  return contentPageMetadata({
    title: meta.title,
    description: meta.description,
    path: meta.path,
  });
}

export default async function ComparePage({ params }: ComparePageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const data = getComparisonBySlug(slug);

  const isLegacySlug = !slug.startsWith("worksmartos-vs-");

  if (isLegacySlug) {
    const correctUrl = `/compare/worksmartos-vs-${slug}/`;

    return (
      <>
        <title>Redirecting...</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`https://worksmartos.co.uk${correctUrl}`} />
        <meta httpEquiv="refresh" content={`0;url=${correctUrl}`} />
        <script
          dangerouslySetInnerHTML={{
            // correctUrl derives from the route slug: never interpolate raw.
            __html: redirectScript(correctUrl),
          }}
        />
        <noscript>
          <meta httpEquiv="refresh" content={`0;url=${correctUrl}`} />
          <p>Redirecting to <a href={correctUrl}>{correctUrl}</a>...</p>
        </noscript>
      </>
    );
  }

  if (!data) {
    notFound();
  }

  const { frontmatter, content } = data;
  const pagePath = `/compare/worksmartos-vs-${frontmatter.slug}/`;
  const breadcrumbLabels = [
    { name: "Compare", path: "/compare/" },
    { name: `WorkSmartOS vs ${frontmatter.competitorName}`, path: pagePath },
  ];

  const jsonLdData = contentPageJsonLd(
    pagePath,
    `WorkSmartOS vs ${frontmatter.competitorName}`,
    `Compare WorkSmartOS MaintenanceOS with ${frontmatter.competitorName} (${frontmatter.category}). Verifiable facts only — no invented claims.`,
    breadcrumbLabels,
  );

  const htmlContent = markdownToHtml(content);

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PageHero
        eyebrow="Comparison"
        title={`WorkSmartOS vs ${frontmatter.competitorName}`}
        lede={`Compare WorkSmartOS MaintenanceOS with ${frontmatter.competitorName} (${frontmatter.category}). Verifiable facts only — no invented claims.`}
      />

      <section className="mx-auto max-w-4xl space-y-12 px-4 py-12">
        <div
          className="prose prose-sm max-w-none text-muted"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <section aria-labelledby="sources" className="border-t border-border pt-8">
          <h2 id="sources" className="text-xl font-semibold text-ink">
            Sources
          </h2>
          <p className="mt-2 text-sm text-muted">
            All competitor claims sourced from public pages on the dates shown. WorkSmartOS claims reflect pre-launch status as documented on worksmartos.co.uk. No invented metrics, customers, certifications, or prices.
          </p>
          <ol className="mt-4 space-y-2 text-sm text-muted list-decimal list-inside">
            {frontmatter.sourceUrls.map((source, index) => (
              <li key={index}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline"
                >
                  {source.title}
                </a>
                {" — "}
                <span>{source.url}</span>
                {" (accessed "}
                <span>{source.accessed}</span>
                {")"}
                {source.claims.length > 0 && (
                  <span className="ml-2 text-xs text-muted">
                    [Claims: {source.claims.join(", ")}]
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
        <PreLaunchRecoveryNav
          links={[
            { href: "/compare/", label: "Compare" },
            { href: "/help/", label: "Help" },
            { href: "/trust/", label: "Trust" },
            { href: "/contact/", label: "Contact" },
          ]}
          note="Comparison page only — not a live sales desk, and not a live phone."
        />

      </section>
    </>
  );
}