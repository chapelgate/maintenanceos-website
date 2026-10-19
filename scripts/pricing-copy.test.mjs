import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync("src/app/pricing/page.tsx", "utf8");
const config = fs.readFileSync("src/config/pricing.ts", "utf8");

test("rendered pricing copy says invented list prices at most once", () => {
  const rendered = `${page}\n${config}`;
  const hits = rendered.match(/invented list prices/g) ?? [];
  assert.ok(hits.length <= 1, `found ${hits.length} occurrences`);
  assert.equal(hits.length, 1);
  assert.match(page, /^const notSoldAsLive = \[/m);
  assert.doesNotMatch(page, /\n {2}const notSoldAsLive/);
});

test("pricing page static output contains h1 heading", () => {
  const html = fs.readFileSync("out/pricing/index.html", "utf8");
  assert.match(html, /<h1[^>]*>Pricing<\/h1>/);
});
