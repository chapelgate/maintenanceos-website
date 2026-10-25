import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HELP = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src/content/help");
const emergency = fs.readFileSync(path.join(HELP, "emergency-procedures.mdx"), "utf8");
const billing = fs.readFileSync(path.join(HELP, "billing-subscriptions.mdx"), "utf8");

test("emergency help does not publish a staffed round-the-clock desk", () => {
  assert.doesNotMatch(emergency, /Dedicated 24\/7 support desk/);
  assert.doesNotMatch(emergency, /24\/7 availability/);
  assert.match(emergency, /no dedicated 24\/7 support desk/i);
  assert.match(emergency, /not a live support desk/i);
  assert.match(emergency, /0800 111 999/);
});

test("billing help does not publish an uptime promise or VAT registration", () => {
  assert.doesNotMatch(billing, /99\.9%/);
  assert.doesNotMatch(billing, /1-hour support response/);
  assert.doesNotMatch(billing, /UK VAT registered/i);
  assert.match(billing, /not a live SLA/i);
  assert.match(billing, /does not publish a VAT number/i);
});
