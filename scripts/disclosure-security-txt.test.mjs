import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(
  path.join(ROOT, "src/app/vulnerability-disclosure/page.tsx"),
  "utf8",
);
const security = fs.readFileSync(
  path.join(ROOT, "public/.well-known/security.txt"),
  "utf8",
);

test("disclosure page links the same contact as security.txt", () => {
  assert.match(page, /href="\/\.well-known\/security\.txt"/);
  assert.match(page, /no paid bug bounty/);
  assert.match(page, /response-time promise/);
  assert.match(security, /^Contact: mailto:info@chapelgatetechnologies\.com$/m);
  assert.match(page, /mailto:info@chapelgatetechnologies\.com/);
  assert.match(page, /PageHero/);
});

test("disclosure page does not offer a reward", () => {
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /reward/i);
  assert.doesNotMatch(page, /qualifying disclosures/);
  assert.doesNotMatch(page, /<strong>Bounty:<\/strong>/);
});
