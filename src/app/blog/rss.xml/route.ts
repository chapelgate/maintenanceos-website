import { getAllBlogPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const posts = getAllBlogPosts();
  const siteUrl = absoluteUrl("/").replace(/\/$/, "");
  const blogUrl = `${siteUrl}/blog/`;

  const rssItems = posts.map((post) => {
    const { frontmatter, content } = post;
    const postUrl = absoluteUrl(`/blog/${frontmatter.slug}/`);
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
    <language>en-GB</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl("/blog/rss.xml")}" rel="self" type="application/rss+xml" />
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