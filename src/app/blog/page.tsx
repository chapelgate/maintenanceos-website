import type { Metadata } from "next";
import { getAllBlogPosts, getBlogPostSlugs } from "@/lib/blog";
import { contentPageMetadata } from "@/lib/page-meta";
import { contentPageJsonLd } from "@/lib/json-ld";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { FunnelPathStrip } from "@/components/FunnelPathStrip";
import { CtaPair } from "@/components/CtaPair";

export async function generateStaticParams() {
  const slugs = getBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(): Promise<Metadata> {
  return contentPageMetadata({
    title: "WorkSmartOS Blog: Maintenance Operations, AI Safety, UK Regulations",
    description: "Pre-launch insights on UK property maintenance operations, AI safety architecture, regulatory compliance, and product updates. Verifiable claims only.",
    path: "/blog/",
  });
}

export default async function BlogIndexPage() {
  const posts = getAllBlogPosts();
  const blogPath = "/blog/";
  const jsonLdData = contentPageJsonLd(
    blogPath,
    "WorkSmartOS Blog",
    "Pre-launch insights on UK property maintenance operations, AI safety architecture, regulatory compliance, and product updates.",
    [
      { name: "Blog", path: blogPath },
    ],
  );

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PageHero
        title="Blog"
        lede="Pre-launch insights on UK property maintenance operations, AI safety architecture, regulatory compliance, and product updates. Verifiable claims only — no invented metrics."
      />
      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12">
        <FunnelPathStrip linked />
        <section aria-labelledby="posts">
          <h2 id="posts" className="text-2xl font-semibold text-ink">
            All Posts
          </h2>
          <div className="mt-8 space-y-8">
            {posts.map((post) => {
              const { frontmatter, content } = post;
              const postUrl = `/blog/${frontmatter.slug}/`;
              const date = new Date(frontmatter.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              const excerpt = content
                .replace(/[#*`\[\]]/g, "")
                .split("\n")
                .find((line) => line.trim().length > 50) ?? frontmatter.description;

              return (
                <article
                  key={frontmatter.slug}
                  className="border border-border rounded-xl p-6 hover:border-accent/50 transition-colors"
                >
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs text-accent font-medium">{frontmatter.category}</span>
                    {frontmatter.tags.map((tag) => (
                      <span key={tag} className="text-xs text-muted border border-border px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-2">
                    <a href={postUrl} className="hover:text-accent underline underline-offset-2">
                      {frontmatter.title}
                    </a>
                  </h3>
                  <p className="text-sm text-muted mb-3 line-clamp-3">{excerpt}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                    <time dateTime={frontmatter.date}>{date}</time>
                    <span>•</span>
                    <span>{frontmatter.author}</span>
                    <span>•</span>
                    <a
                      href={postUrl}
                      className="text-accent underline underline-offset-1 hover:text-accent/80"
                    >
                      Read more
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section className="border-t border-border pt-8">
          <CtaPair />
        </section>
        <p className="mt-8 text-sm text-muted">
          Related pre-launch pages:{" "}
          <a href="/help/" className="font-medium text-accent underline-offset-4 hover:underline">Help</a>
          {" · "}
          <a href="/trust/" className="font-medium text-accent underline-offset-4 hover:underline">Trust</a>
          {" · "}
          <a href="/security/" className="font-medium text-accent underline-offset-4 hover:underline">Security</a>
          {" · "}
          <a href="/contact/" className="font-medium text-accent underline-offset-4 hover:underline">Contact</a>
          . Documentation surfaces only — not a live blog support desk.
        </p>
      </div>
    </>
  );
}