import assert from "node:assert/strict";
import test from "node:test";
import { getBlogPostBySlug } from "./blog.ts";
import { getHelpArticleBySlug } from "./help.ts";

test("getBlogPostBySlug rejects path traversal slugs", () => {
  const maliciousSlugs = ["../../../etc/passwd", "../..", "..", "a/../../b", "./etc/passwd"];
  for (const slug of maliciousSlugs) {
    assert.equal(getBlogPostBySlug(slug), null, `should reject slug: ${slug}`);
  }
});

test("getBlogPostBySlug accepts valid slugs", () => {
  const article = getBlogPostBySlug("ai-voice-demo-browser-only-what-it-means");
  assert.ok(article !== null);
  assert.equal(article!.frontmatter.slug, "ai-voice-demo-browser-only-what-it-means");
});

test("getHelpArticleBySlug rejects path traversal slugs", () => {
  const maliciousSlugs = ["../../../etc/passwd", "../..", "..", "a/../../b", "./etc/passwd"];
  for (const slug of maliciousSlugs) {
    assert.equal(getHelpArticleBySlug(slug), null, `should reject slug: ${slug}`);
  }
});

test("getHelpArticleBySlug accepts valid slugs", () => {
  const article = getHelpArticleBySlug("getting-started");
  assert.ok(article !== null);
  assert.equal(article!.frontmatter.slug, "getting-started");
});
