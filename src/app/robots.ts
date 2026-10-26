import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

const origin = absoluteUrl("/").replace(/\/$/, "");

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // website URL → check → review → pack → optional scripted sandbox → early access
  // Customer website crawl is retired
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/status/",
          "/buyers/",
          "/create/*?step=",
          "/_next/",
          "/static/",
          "/fonts/",
          "/media/",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "Bytespider",
        allow: "/",
      },
      {
        userAgent: "CCBot",
        allow: "/",
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: "https://worksmartos.co.uk",
  };
}