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

test("vulnerability disclosure does not invent a response-time SLA", () => {
  assert.match(page, /does not publish a\s+response-time SLA/i);
  assert.match(page, /no\s+response-time promise/i);
  assert.doesNotMatch(page, /\bpromptly\b/i);
  assert.doesNotMatch(page, /within \d+ business days/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
