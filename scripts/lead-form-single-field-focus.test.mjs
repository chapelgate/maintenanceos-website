import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const form = fs.readFileSync(path.join(ROOT, "src/components/LeadCaptureForm.tsx"), "utf8");

test("lead form focuses summary for multi-field errors and field for single-field errors", () => {
  assert.match(form, /errorSummaryRef\.current\?\.focus\(\)/);
  assert.match(form, /emailRef\.current\?\.focus\(\)/);
  assert.match(form, /phoneRef\.current\?\.focus\(\)/);
  assert.match(form, /Object\.keys\(errors\)\.length > 1/);
  assert.doesNotMatch(form, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
