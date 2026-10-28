import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/blog.ts"), "utf8");

test("blog exports BlogFrontmatter interface", () => {
  assert.match(src, /export interface BlogFrontmatter/);
});

test("blog exports BlogPost interface", () => {
  assert.match(src, /export interface BlogPost/);
});

test("blog exports getBlogPostBySlug function", () => {
  assert.match(src, /export function getBlogPostBySlug/);
});

test("blog exports getAllBlogPosts function", () => {
  assert.match(src, /export function getAllBlogPosts/);
});

test("blog exports getBlogPostSlugs function", () => {
  assert.match(src, /export function getBlogPostSlugs/);
});

test("blog exports generateBlogMetadata function", () => {
  assert.match(src, /export function generateBlogMetadata/);
});
