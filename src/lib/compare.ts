import fs from "fs";
import path from "path";
import matter from "gray-matter";

/** Supported comparison slugs (must match MDX filenames in content/compare/). */
export const COMPARISON_SLUGS = [
  "fixflo",
  "moneypenny",
  "answerconnect",
  "fasthosts",
  "dialzara",
  "rosie",
  "goodcall",
  "phena",
] as const;

export type ComparisonSlug = (typeof COMPARISON_SLUGS)[number];

export interface ComparisonSource {
  url: string;
  title: string;
  accessed: string;
  claims: string[];
}

export interface ComparisonFrontmatter {
  slug: ComparisonSlug;
  competitorName: string;
  competitorUrl: string;
  category: string;
  tagline: string;
  sourceUrls: ComparisonSource[];
}

export interface ComparisonData {
  frontmatter: ComparisonFrontmatter;
  content: string;
}

/** Load and parse a comparison MDX file by slug. */
export function getComparisonBySlug(slug: string): ComparisonData | null {
  if (!COMPARISON_SLUGS.includes(slug as ComparisonSlug)) {
    return null;
  }

  const filePath = path.join(process.cwd(), "src/content/compare", `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContent);

  return {
    frontmatter: data as ComparisonFrontmatter,
    content,
  };
}

/** Get all comparison slugs for static generation. */
export function getAllComparisonSlugs(): ComparisonSlug[] {
  return [...COMPARISON_SLUGS];
}

/** Generate SEO metadata for a comparison page. */
export function generateComparisonMetadata(
  data: ComparisonData,
  _siteUrl: string,
): {
  title: string;
  description: string;
  path: string;
} {
  const { frontmatter } = data;
  const path = `/compare/worksmartos-vs-${frontmatter.slug}/`;

  return {
    title: `WorkSmartOS vs ${frontmatter.competitorName}`,
    description: `Compare WorkSmartOS MaintenanceOS with ${frontmatter.competitorName} (${frontmatter.category}). Verifiable facts only — no invented claims.`,
    path,
  };
}