import { notFound } from "next/navigation";
import { getComparisonBySlug, getAllComparisonSlugs, generateComparisonMetadata } from "@/lib/compare";
import { contentPageMetadata } from "@/lib/page-meta";
import { contentPageJsonLd } from "@/lib/json-ld";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";

interface ComparePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllComparisonSlugs();
  return slugs.map((slug) => ({ slug }));
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

  const meta = generateComparisonMetadata(data, "");
  return contentPageMetadata({
    title: meta.title,
    description: meta.description,
    path: meta.path,
  });
}

export default async function ComparePage({ params }: ComparePageProps) {
  const resolvedParams = await params;
  const data = getComparisonBySlug(resolvedParams.slug);

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

  const htmlContent = content
    .replace(/^# (.+)$/gm, '<h2 class="text-2xl font-semibold text-ink mt-10 mb-4">$1</h2>')
    .replace(/^## (.+)$/gm, '<h3 class="text-xl font-semibold text-ink mt-8 mb-3">$1</h3>')
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split("|").slice(1, -1).map((c) => c.trim());
      if (cells[0].includes("---")) return "";
      return `<div class="overflow-x-auto my-6"><table class="min-w-full divide-y divide-border"><tbody><tr class="bg-surface">${cells
        .map((c) => `<td class="px-4 py-3 text-sm text-ink">${c}</td>`)
        .join("")}</tr></tbody></table></div>`;
    })
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent underline">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-accent pl-4 my-4 text-muted italic">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>')
    .replace(/(<li class="ml-4 mb-1">• .+<\/li>\n)+/g, (match) => `<ul class="list-disc list-inside space-y-1 text-sm text-muted my-4">${match}</ul>`)
    .replace(/\n\n/g, "</p><p class=\"mt-4 text-sm text-muted\">")
    .replace(/^(.+)$/gm, "<p class=\"mt-4 text-sm text-muted\">$1</p>");

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
      </section>
    </>
  );
}