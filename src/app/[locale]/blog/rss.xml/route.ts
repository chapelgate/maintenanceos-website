import { getAllBlogPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/site-url";
import { locales } from "@/i18n/config";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }): Promise<Response> {
  const { locale } = await params;
  const posts = getAllBlogPosts();
  const siteUrl = absoluteUrl("/").replace(/\/$/, "");
  const blogUrl = `${siteUrl}/${locale}/blog/`;

  const rssItems = posts.map((post) => {
    const { frontmatter, content } = post;
    const postUrl = absoluteUrl(`/${locale}/blog/${frontmatter.slug}/`);
    const pubDate = new Date(frontmatter.date).toUTCString();

    const description = content
      .replace(/[#*`\[\]]/g, "")
      .split("\n")
      .find((line) => line.trim().length > 50) ?? frontmatter.description;

    return `
    <item>
      <title><![CDATA[${frontmatter.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <category>${frontmatter.category}</category>
      ${frontmatter.tags.map((tag) => `<category>${tag}</category>`).join("")}
      <author>${frontmatter.author}</author>
    </item>
    `;
  }).join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>WorkSmartOS Blog</title>
    <link>${blogUrl}</link>
    <description>Pre-launch insights on UK property maintenance operations, AI safety architecture, regulatory compliance, and product updates. Verifiable claims only.</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl(`/${locale}/blog/rss.xml`)}" rel="self" type="application/rss+xml" />
    <image>
      <url>${siteUrl}/og-image.webp</url>
      <title>WorkSmartOS</title>
      <link>${siteUrl}</link>
      <width>1200</width>
      <height>630</height>
    </image>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}