import assert from "node:assert/strict";
import test from "node:test";
import { getAllHelpArticles, getHelpArticleBySlug, getHelpArticleSlugs, getHelpCategories, getHelpArticlesByCategory } from "./help.ts";

test("should return all help article slugs", () => {
  const slugs = getHelpArticleSlugs();
  assert.ok(slugs.length > 0);
  assert.ok(slugs.includes("getting-started"));
  assert.ok(slugs.includes("faq"));
});

test("should return all help articles with frontmatter and content", () => {
  const articles = getAllHelpArticles();
  assert.ok(articles.length > 0);
  articles.forEach((article) => {
    assert.ok(article.frontmatter);
    assert.ok(article.frontmatter.slug);
    assert.ok(article.frontmatter.title);
    assert.ok(article.frontmatter.description);
    assert.ok(article.frontmatter.date);
    assert.ok(article.frontmatter.author);
    assert.ok(article.frontmatter.category);
    assert.ok(Array.isArray(article.frontmatter.tags));
    assert.ok(article.content);
    assert.equal(typeof article.content, "string");
  });
});

test("should return article by slug", () => {
  const article = getHelpArticleBySlug("getting-started");
  assert.ok(article !== null);
  assert.equal(article!.frontmatter.slug, "getting-started");
  assert.equal(article!.frontmatter.title, "Getting Started with MaintenanceOS");
});

test("should return null for non-existent slug", () => {
  const article = getHelpArticleBySlug("non-existent-slug");
  assert.equal(article, null);
});

test("should return all categories in order", () => {
  const categories = getHelpCategories();
  assert.ok(categories.length > 0);
  assert.equal(categories[0], "Getting Started");
  assert.ok(categories.includes("Compliance"));
  assert.ok(categories.includes("Features"));
  assert.ok(categories.includes("Integrations"));
});

test("should filter articles by category", () => {
  const complianceArticles = getHelpArticlesByCategory("Compliance");
  assert.ok(complianceArticles.length > 0);
  complianceArticles.forEach((article) => {
    assert.equal(article.frontmatter.category, "Compliance");
  });
});

test("should have at least 20 articles", () => {
  const articles = getAllHelpArticles();
  assert.ok(articles.length >= 20);
});

test("should have unique slugs", () => {
  const slugs = getHelpArticleSlugs();
  const uniqueSlugs = new Set(slugs);
  assert.equal(uniqueSlugs.size, slugs.length);
});

test("should have valid date format", () => {
  const articles = getAllHelpArticles();
  articles.forEach((article) => {
    const date = new Date(article.frontmatter.date);
    assert.notEqual(date.toString(), "Invalid Date");
  });
});