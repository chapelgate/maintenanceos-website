import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("lead capture form success copy says no email sent locally", () => {
  const form = read("src/components/LeadCaptureForm.tsx");
  assert.match(form, /no email was sent/);
  assert.match(form, /lead queue before launch/);
  assert.match(form, /A form endpoint is not configured yet/);
  assert.match(form, /recorded locally for this session/);
});

test("lead capture form does not claim confirmed booking or checkout", () => {
  const form = read("src/components/LeadCaptureForm.tsx");
  assert.doesNotMatch(form, /booking confirmation/);
  assert.doesNotMatch(form, /checkout complete/);
  assert.doesNotMatch(form, /order confirmed/);
  assert.doesNotMatch(form, /live calendar/);
  assert.doesNotMatch(form, /paid/);
});

test("lead capture form uses mailto public enquiry email not a live desk", () => {
  const form = read("src/components/LeadCaptureForm.tsx");
  const pub = read("src/lib/public-enquiry.ts");
  assert.match(pub, /PUBLIC_ENQUIRY_EMAIL/);
  assert.match(form, /leadType/);
  assert.match(form, /mailto/);
});