import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const config = fs.readFileSync("src/config/pricing.ts", "utf8");

test("pricing config uses the publishable-label check", () => {
  const gate = config.slice(config.indexOf("export function getPricingConfig"));
  assert.match(gate, /isPublishablePriceLabel\(/);
  assert.doesNotMatch(gate, /priceLabel\.trim\(\)\.length > 0/);
});
