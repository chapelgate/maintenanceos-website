import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("blog index page has content page metadata", () => {
  const page = read("src/app/blog/page.tsx");
  assert.ok(page.includes('title: "WorkSmartOS Blog'));
  assert.ok(page.includes('description: "Pre-launch insights'));
  assert.ok(page.includes('path: "/blog/"'));
  assert.ok(page.includes('generateMetadata'));
});

test("blog index page has PageHero with pre-launch declaration", () => {
  const page = read("src/app/blog/page.tsx");
  assert.match(page, /Pre-launch/);
  assert.match(page, /Verifiable claims only/);
  assert.match(page, /Blog/);
});

test("blog index page has JsonLd metadata", () => {
  const page = read("src/app/blog/page.tsx");
  assert.ok(page.includes("JsonLd data"));
  assert.ok(page.includes('/blog/'));
});

test("blog index page has CTA pair", () => {
  const page = read("src/app/blog/page.tsx");
  assert.match(page, /CtaPair/);
  assert.match(page, /Read more/);
});

test("blog index page has FunnelPathStrip", () => {
  const page = read("src/app/blog/page.tsx");
  assert.match(page, /FunnelPathStrip/);
});

test("blog index page has blog posts listing", () => {
  const page = read("src/app/blog/page.tsx");
  assert.match(page, /getAllBlogPosts/);
  assert.match(page, /All Posts/);
  assert.match(page, /frontmatter.slug/);
});