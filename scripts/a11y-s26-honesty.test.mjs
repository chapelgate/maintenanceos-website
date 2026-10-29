import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/accessibility/page.tsx"), "utf8");

test("accessibility page does not invent S26 deploy or validate-CI theatre", () => {
  assert.match(page, /S26 source merge is not a production deploy claim/);
  assert.match(page, /merged in source/);
  assert.match(page, /does not claim a production redeploy/);
  assert.doesNotMatch(page, /pending deployment/i);
  assert.doesNotMatch(page, /PR #315 can merge/);
  assert.doesNotMatch(page, /validate<\/code> CI failure/);
  assert.doesNotMatch(page, /2 business days/);
  assert.match(page, /does not\s+publish a response-time SLA/);
});