import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = fs.readFileSync(path.join(ROOT, "src/config/pricing.ts"), "utf8");
const page = fs.readFileSync(path.join(ROOT, "src/app/pricing/page.tsx"), "utf8");
const site = fs.readFileSync(path.join(ROOT, "src/config/site.ts"), "utf8");

test("public launch defaults false so pricing stays prelaunch", () => {
  assert.match(
    site,
    /publicLaunch:\s*envFlag\(\s*process\.env\.NEXT_PUBLIC_PUBLIC_LAUNCH,\s*false\s*\)/,
  );
});

test("prelaunch pricing is request-only with no published list or checkout", () => {
  const start = config.indexOf("const prelaunch");
  const end = config.indexOf("const published");
  assert.ok(start >= 0 && end > start, "prelaunch block missing");
  const prelaunch = config.slice(start, end);
  assert.match(prelaunch, /cardTitle:\s*"Request pricing"/);
  assert.match(prelaunch, /no published price list/i);
  assert.match(prelaunch, /no self-serve checkout/i);
  assert.match(prelaunch, /not generally available/i);
  assert.match(prelaunch, /shared on request/i);
  assert.match(prelaunch, /label:\s*"Request an early demo"/);
  assert.doesNotMatch(prelaunch, /£/);
  assert.doesNotMatch(prelaunch, /buy now/i);
  assert.doesNotMatch(prelaunch, /Add to cart/i);
});

test("getPricingConfig keeps showTiers false in prelaunch", () => {
  const gate = config.slice(config.indexOf("export function getPricingConfig"));
  assert.match(gate, /showTiers:\s*false/);
  assert.match(gate, /tiers:\s*\[\]\s*as\s*PricingTier\[\]/);
  assert.match(gate, /isPublishablePriceLabel/);
});

test("pricing page renders request card when showTiers is false", () => {
  assert.match(page, /showTiers/);
  assert.match(page, /Request pricing|pricing\.cardTitle/);
  assert.match(page, /getPricingConfig/);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
