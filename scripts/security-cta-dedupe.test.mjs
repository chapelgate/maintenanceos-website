import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/security/page.tsx"), "utf8");

test("security privacy section has one CtaPair and one subprocessor link", () => {
  const pairs = page.match(/<CtaPair\b/g) || [];
  assert.equal(pairs.length, 1);
  assert.match(page, /primaryHref=["']\/demo\/["']/);
  assert.match(page, /secondaryHref=["']\/vulnerability-disclosure\/["']/);
  assert.match(page, /href=["']\/subprocessors\/["']/);
  assert.match(page, /not a live operations console/);
  assert.match(page, /does not claim Cyber\s+Essentials certification/);
});

test("security page does not duplicate disclosure or subprocessor CTAs", () => {
  assert.equal((page.match(/secondaryLabel=["']Vulnerability disclosure["']/g) || []).length, 1);
  assert.doesNotMatch(page, /primaryHref=["']\/subprocessors\/["']/);
  assert.doesNotMatch(page, /Vulnerability disclosure page/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
});
