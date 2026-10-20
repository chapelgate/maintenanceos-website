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

test("pricing config has 3 tiers defined for published mode", () => {
  // Check that published.tiers array has 3 entries
  const tiersMatch = config.match(/tiers:\s*\[([\s\S]*?)\]\s+as\s+PricingTier\[\]/);
  assert.ok(tiersMatch, "published.tiers array not found");
  const tiersContent = tiersMatch[1];
  // Count tier objects (each has an 'id' property)
  const tierIds = tiersContent.match(/id:\s*["']([^"']+)["']/g) ?? [];
  assert.equal(tierIds.length, 3, `expected 3 tiers, found ${tierIds.length}`);
  const expectedIds = ["starter", "professional", "enterprise"];
  for (const id of expectedIds) {
    assert.ok(tiersContent.includes(`id: "${id}"`), `tier ${id} not found`);
  }
});

test("pricing page has TierCard component for rendering tiers", () => {
  assert.match(page, /function TierCard/);
  assert.match(page, /pricing\.tiers\.map/);
  assert.match(page, /showTiers/);
});

test("pricing page static output contains h1 heading", () => {
  const html = fs.readFileSync("out/pricing/index.html", "utf8");
  assert.match(html, /<h1[^>]*>Pricing<\/h1>/);
});