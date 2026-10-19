import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogFrontmatter {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  category: string;
  coverImage?: string;
}

export interface BlogPost {
  frontmatter: BlogFrontmatter;
  content: string;
}

function getAllBlogSlugs(): string[] {
  const blogDir = path.join(process.cwd(), "src/content/blog");
  if (!fs.existsSync(blogDir)) {
    return [];
  }
  return fs
    .readdirSync(blogDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(".mdx", ""))
    .sort((a, b) => {
      const postA = getBlogPostBySlug(a);
      const postB = getBlogPostBySlug(b);
      if (!postA || !postB) return 0;
      return new Date(postB.frontmatter.date).getTime() - new Date(postA.frontmatter.date).getTime();
    });
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(process.cwd(), "src/content/blog", `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContent);

  return {
    frontmatter: data as BlogFrontmatter,
    content,
  };
}

export function getAllBlogPosts(): BlogPost[] {
  return getAllBlogSlugs().map((slug) => getBlogPostBySlug(slug)!).filter(Boolean);
}

export function getBlogPostSlugs(): string[] {
  return getAllBlogSlugs();
}

export function generateBlogMetadata(
  post: BlogPost,
): {
  title: string;
  description: string;
  path: string;
} {
  const { frontmatter } = post;
  const blogPath = `/blog/${frontmatter.slug}/`;

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    path: blogPath,
  };
}