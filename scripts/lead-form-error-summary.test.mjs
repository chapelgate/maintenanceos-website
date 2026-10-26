import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const form = fs.readFileSync(
  path.join(ROOT, "src/components/LeadCaptureForm.tsx"),
  "utf8",
);

test("lead form collects email and phone field errors together", () => {
  assert.match(form, /isValidEnquiryPhone/);
  assert.match(form, /const emailInvalid/);
  assert.match(form, /const phoneInvalid/);
  assert.match(form, /setFieldErrors\(errors\)/);
  assert.match(form, /errorSummaryRef\.current\?\.focus\(\)/);
});

test("lead form exposes a focusable multi-field error summary", () => {
  assert.match(form, /data-lead-error-summary="true"/);
  assert.match(form, /Please fix the following:/);
  assert.match(form, /tabIndex=\{-1\}/);
  assert.match(form, /role="alert"/);
  assert.match(form, /href=\{`#\$\{emailFieldId\}`\}/);
  assert.match(form, /href=\{`#\$\{phoneFieldId\}`\}/);
  assert.match(form, /id=\{emailFieldId\}/);
  assert.match(form, /id=\{phoneFieldId\}/);
  assert.doesNotMatch(form, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
