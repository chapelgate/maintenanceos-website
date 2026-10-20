import assert from "node:assert/strict";
import test from "node:test";
import { generateSitemapEntries } from "../../scripts/generate-sitemap.ts";
import {
  getAllComparisonSlugs,
  getComparisonBySlug,
  generateComparisonMetadata,
} from "./compare.ts";

const competitors = [
  "fixflo", "moneypenny", "answerconnect", "fasthosts",
  "dialzara", "rosie", "goodcall", "phena",
];

test("static comparison slugs match the public canonical URLs", () => {
  assert.deepEqual(
    getAllComparisonSlugs(),
    competitors.map((slug) => `worksmartos-vs-${slug}`),
  );
});

for (const competitor of competitors) {
  test(`canonical ${competitor} route loads content with matching metadata`, () => {
    const data = getComparisonBySlug(`worksmartos-vs-${competitor}`);
    assert.ok(data);
    assert.equal(data.frontmatter.slug, competitor);
    assert.ok(data.content.length > 0);
    assert.equal(
      generateComparisonMetadata(data, "").path,
      `/compare/worksmartos-vs-${competitor}/`,
    );
    assert.deepEqual(getComparisonBySlug(competitor), data);
  });
}

test("unknown and malformed comparison slugs do not load content", () => {
  for (const slug of ["unknown", "worksmartos-vs-unknown", "../fixflo", "worksmartos-vs-worksmartos-vs-fixflo"]) {
    assert.equal(getComparisonBySlug(slug), null);
  }
});

test("standalone sitemap publishes the comparison index and only canonical comparison pages", () => {
  const expected = ["/compare/", ...competitors.map((slug) => `/compare/worksmartos-vs-${slug}/`)];
  assert.deepEqual(
    generateSitemapEntries().filter((entry) => new URL(entry.url).pathname.startsWith("/compare/"))
      .map((entry) => new URL(entry.url).pathname),
    expected,
  );
});
