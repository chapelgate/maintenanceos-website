import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHelpArticleBySlug, getHelpArticleSlugs, generateHelpMetadata } from "@/lib/help";
import { contentPageMetadata } from "@/lib/page-meta";
import { contentPageJsonLd } from "@/lib/json-ld";
import { JsonLd } from "@/components/JsonLd";
import { markdownToHtml } from "@/lib/markdown-to-html";
import { PageHero } from "@/components/PageHero";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { CtaPair } from "@/components/CtaPair";
import { PreLaunchRecoveryNav } from "@/components/PreLaunchRecoveryNav";

interface HelpArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getHelpArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: HelpArticlePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = getHelpArticleBySlug(resolvedParams.slug);

  if (!article) {
    return contentPageMetadata({
      title: "Help Article Not Found",
      description: "The requested help article does not exist.",
      path: "/404",
    });
  }

  const meta = generateHelpMetadata(article);
  return contentPageMetadata(meta);
}

export default async function HelpArticlePage({ params }: HelpArticlePageProps) {
  const resolvedParams = await params;
  const article = getHelpArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const { frontmatter, content } = article;
  const articlePath = `/help/${frontmatter.slug}/`;
  const breadcrumbLabels = [
    { name: "Help Centre", path: "/help/" },
    { name: frontmatter.title, path: articlePath },
  ];

  const jsonLdData = contentPageJsonLd(
    articlePath,
    frontmatter.title,
    frontmatter.description,
    breadcrumbLabels,
  );

  const htmlContent = markdownToHtml(content);

  const date = new Date(frontmatter.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PageHero
        eyebrow="Help Centre"
        title={frontmatter.title}
        lede={frontmatter.description}
      />
      <article className="mx-auto max-w-4xl space-y-12 px-4 py-12">
        <FunnelPathStrip linked />
        <header className="border-b border-border pb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-accent font-medium">{frontmatter.category}</span>
            {frontmatter.tags.map((tag) => (
              <span key={tag} className="text-xs text-muted border border-border px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            <time dateTime={frontmatter.date}>{date}</time>
            <span>•</span>
            <span>{frontmatter.author}</span>
          </div>
        </header>

        <div
          className="prose prose-sm max-w-none text-muted"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <section className="border-t border-border pt-8">
          <CtaPair />
        </section>

        <PreLaunchRecoveryNav
          links={[
            { href: "/help/", label: "Help centre" },
            { href: "/faq/", label: "FAQ" },
            { href: "/trust/", label: "Trust" },
            { href: "/contact/", label: "Contact" },
          ]}
          note="Help article only — not a live support desk, and not a live phone."
        />
      </article>
    </>
  );
}