import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("contact page keeps GA-desk and phone-provisioning denials", () => {
  const page = read("src/app/contact/page.tsx");
  assert.match(page, /not a GA support desk/);
  assert.match(page, /not live phone provisioning/);
  assert.match(page, /no invented (response )?SLA/);
  assert.match(page, /No published response-time turnaround on this draft site\. Not a support SLA\./);
  assert.doesNotMatch(page, /we reply within/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("pricing FAQ keeps no-live-phone; coming telephony stays in pricing config", () => {
  const faqs = read("src/content/faqs.ts");
  const config = read("src/config/pricing.ts");
  assert.match(faqs, /no live phone is included in any published plan/i);
  assert.doesNotMatch(faqs, /Live telephony and calendar booking are coming/i);
  assert.match(config, /coming \/ early access/);
  assert.doesNotMatch(faqs, /£/);
  assert.doesNotMatch(faqs, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
