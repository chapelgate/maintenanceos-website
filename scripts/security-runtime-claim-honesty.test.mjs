import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/security/page.tsx"), "utf8");

test("security page softens runtime guarantees on this marketing site", () => {
  assert.match(page, /audit trail designed into the product/);
  assert.match(page, /Not a live production guarantee on this site/);
  assert.match(page, /Enforcement paths are tested in source code/);
  assert.match(page, /not a live customer record/);
  assert.doesNotMatch(page, /immutable audit trail/);
  assert.doesNotMatch(page, /verified by automated test suites/);
  assert.doesNotMatch(page, /permanently recorded/);
  assert.doesNotMatch(page, /Cyber Essentials certified/i);
  assert.doesNotMatch(page, /buy now/i);
});
