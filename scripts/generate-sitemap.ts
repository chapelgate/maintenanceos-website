import { execSync } from "node:child_process";
import { statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getAllComparisonSlugs } from "../src/lib/compare.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

interface SitemapEntry {
  url: string;
  lastmod: string;
  changeFrequency: "monthly" | "weekly" | "daily" | "yearly" | "always" | "never";
  priority: number;
}

function getGitLastMod(filePath: string): string | null {
  try {
    const relativePath = filePath.replace(REPO_ROOT + "/", "");
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

function getLastModForPath(path: string): string {
  // Map marketing paths to their page.tsx files
  const pathToFile: Record<string, string> = {
    "/": "src/app/page.tsx",
    "/how-it-works/": "src/app/how-it-works/page.tsx",
    "/features/": "src/app/features/page.tsx",
    "/compare/": "src/app/compare/page.tsx",
    ...Object.fromEntries(getAllComparisonSlugs().map((slug) => [
      `/compare/${slug}/`,
      `src/content/compare/${slug.replace(/^worksmartos-vs-/, "")}.mdx`,
    ])),
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

function getMarketingPaths(): string[] {
  return [
    "/",
    "/how-it-works/",
    "/features/",
    "/compare/",
    ...getAllComparisonSlugs().map((slug) => `/compare/${slug}/`),
    "/property-maintenance-software/",
    "/ai-receptionist/",
    "/create/",
    "/how-we-keep-control/",
    "/security/",
    "/industries/",
    "/industries/landlords/",
    "/industries/letting-agents/",
    "/industries/property-managers/",
    "/industries/maintenance-companies/",
    "/industries/housing-associations/",
    "/industries/facilities-management/",
    "/industries/councils/",
    "/industries/holiday-lets/",
    "/pricing/",
    "/demo/",
    "/contact/",
    "/about/",
    "/faq/",
    "/privacy/",
    "/cookies/",
    "/terms/",
    "/accessibility/",
    "/vulnerability-disclosure/",
    "/subprocessors/",
  ];
}

function getChangeFrequency(path: string): SitemapEntry["changeFrequency"] {
  if (path === "/") return "weekly";
  if (path.startsWith("/industries/")) return "monthly";
  if (path === "/pricing/" || path === "/demo/" || path === "/create/") return "weekly";
  return "monthly";
}

function getPriority(path: string): number {
  if (path === "/") return 1;
  if (path === "/property-maintenance-software/") return 0.9;
  if (path.startsWith("/industries/")) return 0.7;
  if (path === "/pricing/" || path === "/demo/" || path === "/create/") return 0.8;
  return 0.6;
}

export function generateSitemapEntries(): SitemapEntry[] {
  const paths = getMarketingPaths();
  const siteUrl = "https://worksmartos.co.uk";

  return paths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastmod: getLastModForPath(path),
    changeFrequency: getChangeFrequency(path),
    priority: getPriority(path),
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const entries = generateSitemapEntries();
  console.log(JSON.stringify(entries, null, 2));
  console.log(`Generated ${entries.length} sitemap entries`);
}
