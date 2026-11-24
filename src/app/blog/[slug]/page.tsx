import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostBySlug, getBlogPostSlugs, generateBlogMetadata } from "@/lib/blog";
import { contentPageMetadata } from "@/lib/page-meta";
import { contentPageJsonLd } from "@/lib/json-ld";
import { JsonLd } from "@/components/JsonLd";
import { markdownToHtml } from "@/lib/markdown-to-html";
import { PageHero } from "@/components/PageHero";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { CtaPair } from "@/components/CtaPair";
import { PreLaunchRecoveryNav } from "@/components/PreLaunchRecoveryNav";

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

        <PreLaunchRecoveryNav
          links={[
            { href: "/blog/", label: "Blog" },
            { href: "/help/", label: "Help" },
            { href: "/trust/", label: "Trust" },
            { href: "/contact/", label: "Contact" },
          ]}
          note="Editorial article only — not a live support desk, and not a live phone."
        />
      </article>
    </>
  );
}