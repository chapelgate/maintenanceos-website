import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = fs.readFileSync(path.join(ROOT, "src/config/pricing.ts"), "utf8");
const gate = fs.readFileSync(path.join(ROOT, "src/lib/publishable-price.ts"), "utf8");

test("published tier priceLabels are empty until Andy fills real prices", () => {
  const published = config.slice(config.indexOf("const published"));
  const labels = [...published.matchAll(/priceLabel:\s*("([^"]*)"|'([^']*)')/g)].map(
    (m) => m[2] ?? m[3] ?? "",
  );
  assert.equal(labels.length, 3, `expected 3 priceLabels, found ${labels.length}`);
  for (const label of labels) {
    assert.equal(label, "", `expected empty priceLabel, got ${JSON.stringify(label)}`);
  }
  assert.doesNotMatch(published, /\[ANDY:/);
});

test("getPricingConfig still gates tiers on isPublishablePriceLabel", () => {
  const fn = config.slice(config.indexOf("export function getPricingConfig"));
  assert.match(fn, /isPublishablePriceLabel\(/);
  assert.match(fn, /showTiers:\s*allLabelsPublishable/);
  assert.match(gate, /!trimmed\.startsWith\("\[ANDY:"\)/);
});
