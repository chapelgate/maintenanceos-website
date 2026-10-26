import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const faqs = fs.readFileSync(path.join(ROOT, "src/content/faqs.ts"), "utf8");

test("faqs pricing answer is request-only and not launching-soon theatre", () => {
  assert.match(faqs, /When will pricing be published\?/);
  assert.match(faqs, /No public price list is published on this site/);
  assert.match(faqs, /request an early demo to talk pricing/i);
  assert.match(faqs, /not a booking, checkout, or sale/i);
  assert.doesNotMatch(faqs, /Pricing is launching soon/i);
  assert.doesNotMatch(faqs, /Live telephony and calendar booking are coming/i);
  assert.doesNotMatch(faqs, /£/);
  assert.doesNotMatch(faqs, /buy now/i);
});

test("faqs keep pre-launch and no live-phone framing", () => {
  assert.match(faqs, /not commercially generally available/i);
  assert.match(faqs, /no live phone is included in any published plan/i);
  assert.doesNotMatch(faqs, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
