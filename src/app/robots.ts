import type { MetadataRoute } from "next";
import { getCanonicalSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

/**
 * AI crawlers the owner wants able to read marketing pages and /llms.txt.
 * /llms.txt and /llms-full.txt describe the public funnel:
 * website URL → check → review → pack → optional scripted sandbox → early access.
 * Those files must not claim live phone, always-on, GA, ratings, or invented crawls.
 * Customer website crawl is retired from the public setup path; this robots file only controls crawlers reading this marketing site.
 * Default `*` also allows indexing — there are no admin/private routes in this export.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Google-Extended",
  "anthropic-ai",
  "ClaudeBot",
  "PerplexityBot",
] as const;

export default function robots(): MetadataRoute.Robots {
  const origin = getCanonicalSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
      })),
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
