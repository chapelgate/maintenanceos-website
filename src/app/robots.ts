import type { MetadataRoute } from "next";
import { getCanonicalSiteUrl } from "@/lib/site-url";

/**
 * AI crawlers the owner wants able to read marketing pages and /llms.txt.
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
