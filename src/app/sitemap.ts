import type { MetadataRoute } from "next";
import { marketingPaths } from "@/config/routes";
import { absoluteUrl } from "@/lib/site-url";
import { statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");

function getGitLastMod(filePath: string): string | null {
  try {
    const relativePath = filePath.replace(REPO_ROOT + "/", "").replace(REPO_ROOT + "\\", "");
    const output = execSync(`git log -1 --format="%ci" -- "${relativePath}"`, {
      cwd: REPO_ROOT,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (output) {
      return new Date(output).toISOString().split("T")[0];
    }
  } catch {
    // Git not available or file not in git
  }
  return null;
}

function getFileLastMod(filePath: string): string {
  try {
    const stats = statSync(filePath);
    return stats.mtime.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

import { getAllComparisonSlugs } from "@/lib/compare";
import { getBlogPostSlugs } from "@/lib/blog";
import { getHelpArticleSlugs } from "@/lib/help";

function getLastModForPath(path: string): string {
  const comparisonPaths = Object.fromEntries(getAllComparisonSlugs().map((slug) => [
    `/compare/${slug}/`,
    `src/content/compare/${slug.replace(/^worksmartos-vs-/, "")}.mdx`,
  ]));
  const blogPaths = Object.fromEntries(getBlogPostSlugs().map((slug) => [
    `/blog/${slug}/`,
    `src/content/blog/${slug}.mdx`,
  ]));
  const helpPaths = Object.fromEntries(getHelpArticleSlugs().map((slug) => [
    `/help/${slug}/`,
    `src/content/help/${slug}.mdx`,
  ]));

  const pathToFile: Record<string, string> = {
    "/": "src/app/page.tsx",
    "/how-it-works/": "src/app/how-it-works/page.tsx",
    "/features/": "src/app/features/page.tsx",
    "/compare/": "src/app/compare/page.tsx",
    "/blog/": "src/app/blog/page.tsx",
    "/help/": "src/app/help/page.tsx",
    ...comparisonPaths,
    ...blogPaths,
    ...helpPaths,
    "/property-maintenance-software/": "src/app/property-maintenance-software/page.tsx",
    "/ai-receptionist/": "src/app/ai-receptionist/page.tsx",
    "/create/": "src/app/create/page.tsx",
    "/how-we-keep-control/": "src/app/how-we-keep-control/page.tsx",
    "/security/": "src/app/security/page.tsx",
    "/industries/": "src/app/industries/page.tsx",
    "/industries/landlords/": "src/app/industries/landlords/page.tsx",
    "/industries/letting-agents/": "src/app/industries/letting-agents/page.tsx",
    "/industries/property-managers/": "src/app/industries/property-managers/page.tsx",
    "/industries/maintenance-companies/": "src/app/industries/maintenance-companies/page.tsx",
    "/industries/housing-associations/": "src/app/industries/housing-associations/page.tsx",
    "/industries/facilities-management/": "src/app/industries/facilities-management/page.tsx",
    "/industries/councils/": "src/app/industries/councils/page.tsx",
    "/industries/holiday-lets/": "src/app/industries/holiday-lets/page.tsx",
    "/pricing/": "src/app/pricing/page.tsx",
    "/demo/": "src/app/demo/page.tsx",
    "/contact/": "src/app/contact/page.tsx",
    "/about/": "src/app/about/page.tsx",
    "/faq/": "src/app/faq/page.tsx",
    "/privacy/": "src/app/privacy/page.tsx",
    "/cookies/": "src/app/cookies/page.tsx",
    "/terms/": "src/app/terms/page.tsx",
    "/accessibility/": "src/app/accessibility/page.tsx",
    "/vulnerability-disclosure/": "src/app/vulnerability-disclosure/page.tsx",
    "/subprocessors/": "src/app/subprocessors/page.tsx",
  };

  const filePath = pathToFile[path];
  if (!filePath) {
    return getFileLastMod(join(REPO_ROOT, "src/app/page.tsx"));
  }

  const fullPath = join(REPO_ROOT, filePath);
  const gitDate = getGitLastMod(fullPath);
  if (gitDate) return gitDate;
  return getFileLastMod(fullPath);
}

function getChangeFrequency(path: string): "monthly" | "weekly" | "daily" | "yearly" | "always" | "never" {
  if (path === "/") return "weekly";
  if (path.startsWith("/industries/")) return "monthly";
  if (path === "/pricing/" || path === "/demo/" || path === "/create/") return "weekly";
  return "monthly";
}

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return marketingPaths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: getLastModForPath(path),
    changeFrequency: getChangeFrequency(path),
    priority:
      path === "/"
        ? 1
        : path === "/property-maintenance-software/"
          ? 0.9
          : path.startsWith("/industries/")
            ? 0.7
            : path === "/pricing/" || path === "/demo/" || path === "/create/"
              ? 0.8
              : 0.6,
  }));
}