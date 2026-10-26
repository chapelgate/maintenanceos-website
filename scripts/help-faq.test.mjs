import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/faq.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("faq does not publish unproved hosts, inboxes, or live product claims", () => {
  assert.doesNotMatch(text, /DigitalOcean|Cloudflare|LON1|\bLHR\b/);
  assert.doesNotMatch(text, /dpo@|Settings →/);
  assert.doesNotMatch(text, /Gas Safety \(Installation|Building Safety Act|Homes \(Fitness/);
  assert.doesNotMatch(text, /Full Cymraeg|cannot be bypassed|Assisted migration/i);
  assert.doesNotMatch(text, /£\d|50%\s*off|buy now/i);
  assert.match(text, /no published price list/i);
  assert.match(text, /request/i);
  assert.match(text, /not a live integration/i);
  assert.match(text, /not a live app/i);
  assert.match(text, /Not a public always-on phone/);
  assert.match(text, /not a live SLA/i);
  assert.match(text, /info@chapelgatetechnologies\.com/);
});

test("faq description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
