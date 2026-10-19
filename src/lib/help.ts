import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface HelpFrontmatter {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
}

export interface HelpArticle {
  frontmatter: HelpFrontmatter;
  content: string;
}

function getAllHelpSlugs(): string[] {
  const helpDir = path.join(process.cwd(), "src/content/help");
  if (!fs.existsSync(helpDir)) {
    return [];
  }
  return fs
    .readdirSync(helpDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(".mdx", ""))
    .sort((a, b) => {
      const articleA = getHelpArticleBySlug(a);
      const articleB = getHelpArticleBySlug(b);
      if (!articleA || !articleB) return 0;
      // Sort by category first, then by date (newest first)
      const catOrder = categoryOrder(articleA.frontmatter.category) - categoryOrder(articleB.frontmatter.category);
      if (catOrder !== 0) return catOrder;
      return new Date(articleB.frontmatter.date).getTime() - new Date(articleA.frontmatter.date).getTime();
    });
}

function categoryOrder(category: string): number {
  const order: Record<string, number> = {
    "Getting Started": 1,
    "Configuration": 2,
    "Core Concepts": 3,
    "Safety & Compliance": 4,
    "Compliance": 5,
    "Daily Operations": 6,
    "Features": 7,
    "Integrations": 8,
    "Reports": 9,
    "Account & Billing": 10,
    "Security & Privacy": 11,
    "Troubleshooting": 12,
    "Support": 13,
    "Product Updates": 14,
  };
  return order[category] ?? 99;
}

export function getHelpArticleBySlug(slug: string): HelpArticle | null {
  const filePath = path.join(process.cwd(), "src/content/help", `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContent);

  return {
    frontmatter: data as HelpFrontmatter,
    content,
  };
}

export function getAllHelpArticles(): HelpArticle[] {
  return getAllHelpSlugs().map((slug) => getHelpArticleBySlug(slug)!).filter(Boolean);
}

export function getHelpArticleSlugs(): string[] {
  return getAllHelpSlugs();
}

export function getHelpArticlesByCategory(category: string): HelpArticle[] {
  return getAllHelpArticles().filter((article) => article.frontmatter.category === category);
}

export function getHelpCategories(): string[] {
  const articles = getAllHelpArticles();
  const categories = new Set(articles.map((a) => a.frontmatter.category));
  return Array.from(categories).sort((a, b) => categoryOrder(a) - categoryOrder(b));
}

export function generateHelpMetadata(
  article: HelpArticle,
): {
  title: string;
  description: string;
  path: string;
} {
  const { frontmatter } = article;
  const helpPath = `/help/${frontmatter.slug}/`;

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    path: helpPath,
  };
}

export function generateHelpIndexMetadata(): {
  title: string;
  description: string;
  path: string;
} {
  return {
    title: "Help Centre",
    description: "Searchable documentation for MaintenanceOS: getting started, repairs, compliance, integrations, and more. 25+ articles, versioned in git.",
    path: "/help/",
  };
}