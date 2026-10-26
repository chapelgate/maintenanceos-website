import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const faqs = fs.readFileSync(
  path.join(ROOT, "src/content/objection-faqs.ts"),
  "utf8",
);

test("objection FAQ person-transfer answer stays preview/retest honest", () => {
  assert.match(faqs, /What if the caller asks for a person\?/);
  assert.match(faqs, /explicit-request-only/i);
  assert.match(faqs, /still under retest/i);
  assert.match(faqs, /does not claim a live always-on transfer desk/i);
  assert.doesNotMatch(faqs, /immediately transfers/i);
  assert.doesNotMatch(faqs, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("objection FAQ keeps no live always-on phone claim", () => {
  assert.match(faqs, /Is there a live always-on phone line I can call now\?/);
  assert.match(faqs, /Voice intake is in commissioning preview/i);
  assert.doesNotMatch(faqs, /buy now/i);
});
