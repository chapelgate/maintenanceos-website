import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/data-security.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("data-security does not publish unproved security or privacy operations", () => {
  assert.doesNotMatch(text, /TLS|AES-256|AWS KMS/);
  assert.doesNotMatch(text, /Cyber Essentials|ISO 27001|SOC 2|HackerOne/);
  assert.doesNotMatch(text, /Settings → Privacy/);
  assert.doesNotMatch(text, /dpo@/i);
  assert.doesNotMatch(text, /7 years/);
  assert.doesNotMatch(text, /Twilio|SendGrid|DigitalOcean|Cloudflare/);
  assert.doesNotMatch(text, /72 hours/);
  assert.doesNotMatch(text, /Limitation Act/);
  assert.doesNotMatch(text, /subprocessors|security-questionnaire|incident-response/);
  assert.doesNotMatch(text, /Chapelgate Technologies Ltd/);
  assert.match(text, /not a live security statement/i);
  assert.match(text, /not a live agreement/i);
  assert.match(text, /not a live configuration/i);
  assert.match(text, /not a live rule set/i);
  assert.match(text, /not a live request channel/i);
  assert.match(text, /not verified/i);
  assert.match(text, /not a live desk/i);
  assert.match(text, /not applicable/i);
});

test("data-security description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
