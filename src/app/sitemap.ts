import type { MetadataRoute } from "next";
import { marketingPaths } from "@/config/routes";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return marketingPaths.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "monthly" as const,
    priority:
      path === "/"
        ? 1
        : path === "/property-maintenance-software/"
          ? 0.9
          : path.startsWith("/industries/")
            ? 0.7
            : 0.6,
  }));
}
