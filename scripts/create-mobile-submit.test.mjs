import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("step 1 cannot natively submit before hydration", () => {
  const form = read("src/components/CreateReceptionistForm.tsx");
  assert.match(form, /useSyncExternalStore/);
  assert.match(form, /serverHydratedSnapshot = \(\) => false/);
  assert.match(form, /type="button"/);
  assert.match(form, /disabled=\{!hydrated\}/);
  assert.match(form, /formRef\.current\?\.requestSubmit\(\)/);
  assert.match(form, /Loading form…/);
});

test("final submit is synchronously locked and idempotent", () => {
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");
  assert.match(later, /submitLockedRef\.current/);
  assert.match(later, /submissionIdRef\.current \?\?= createLeadSubmissionId\(\)/);
  assert.match(later, /submissionId: submissionIdRef\.current/);
});

test("accepted request has persistent receipt and truthful email status", () => {
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");
  assert.match(later, /data-create-success=""/);
  assert.match(later, /Request received/);
  assert.match(later, /Reference:/);
  assert.match(later, /Confirmation email: accepted for delivery/);
  assert.match(later, /Your request remains recorded/);
  assert.doesNotMatch(later, /status === "success"[\s\S]{0,900}no confirmation email was sent/i);
});
