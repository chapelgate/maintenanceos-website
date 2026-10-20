import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostBySlug, getBlogPostSlugs, generateBlogMetadata } from "@/lib/blog";
import { contentPageMetadata } from "@/lib/page-meta";
import { contentPageJsonLd } from "@/lib/json-ld";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { CtaPair } from "@/components/CtaPair";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    return contentPageMetadata({
      title: "Blog Post Not Found",
      description: "The requested blog post does not exist.",
      path: "/404",
    });
  }

  const meta = generateBlogMetadata(post);
  return contentPageMetadata({
    title: meta.title,
    description: meta.description,
    path: meta.path,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const { frontmatter, content } = post;
  const postPath = `/blog/${frontmatter.slug}/`;
  const breadcrumbLabels = [
    { name: "Blog", path: "/blog/" },
    { name: frontmatter.title, path: postPath },
  ];

  const jsonLdData = contentPageJsonLd(
    postPath,
    frontmatter.title,
    frontmatter.description,
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
        .join("")}</tr></tbody></div>`;
    })
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent underline">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-accent pl-4 my-4 text-muted italic">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>')
    .replace(/(<li class="ml-4 mb-1">• .+<\/li>\n)+/g, (match) => `<ul class="list-disc list-inside space-y-1 text-sm text-muted my-4">${match}</ul>`)
    .replace(/\n\n/g, "</p><p class=\"mt-4 text-sm text-muted\">")
    .replace(/^(.+)$/gm, "<p class=\"mt-4 text-sm text-muted\">$1</p>");

  const date = new Date(frontmatter.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PageHero
        eyebrow="Blog"
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
      </article>
    </>
  );
}