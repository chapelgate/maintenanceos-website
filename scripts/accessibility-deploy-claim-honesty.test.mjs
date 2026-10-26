import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(
  path.join(ROOT, "src/app/accessibility/page.tsx"),
  "utf8",
);

test("accessibility page does not claim a production deploy or go-live", () => {
  assert.match(page, /S26 source merge is not a production deploy claim/);
  assert.match(page, /does not claim a production redeploy/i);
  assert.match(page, /Keep source honesty separate from deploy/);
  assert.doesNotMatch(page, /pending deployment/i);
  assert.doesNotMatch(page, /Deploy S26 fixes/i);
  assert.doesNotMatch(page, /go live/i);
  assert.doesNotMatch(page, /not yet deployed to\s+production/i);
  assert.doesNotMatch(page, /PR #315 can merge/);
  assert.doesNotMatch(page, /Andy-only/);
  assert.doesNotMatch(page, /deploy\/\*\*/);
  assert.doesNotMatch(page, /nginx frozen/i);
});

test("accessibility feedback does not invent a response-time SLA", () => {
  assert.match(page, /does not\s+publish a response-time SLA/i);
  assert.doesNotMatch(page, /within 2 business days/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
