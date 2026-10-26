import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/privacy/page.tsx"), "utf8");

test("privacy sharing points to a draft planned subprocessor register", () => {
  assert.match(page, /draft planned subprocessor register/i);
  assert.match(page, /pending legal review/i);
  assert.match(page, /not a live Twilio\/SendGrid\/Google processing claim/i);
  assert.doesNotMatch(page, /For a full list of subprocessors/);
});

test("privacy page stays a draft notice without launch-flag sales copy", () => {
  assert.match(page, /Privacy Policy \(Draft\)/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
});
