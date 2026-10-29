import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS_DIR = path.join(ROOT, "docs");

function readDoc(rel) {
  if (!fs.existsSync(path.join(DOCS_DIR, rel))) {
    test.skip(`${rel} does not exist yet`);
    return "";
  }
  return fs.readFileSync(path.join(DOCS_DIR, rel), "utf8");
}

test("docs honesty: security baseline doc does not claim arbitrary headers", () => {
  const doc = readDoc("security/static-security-baseline.md");
  if (doc === "") return;
  assert.match(doc, /cannot emit|App Platform static|not arbitrary/i);
});

test("docs honesty: demo script has pre-launch synthetic disclaimer", () => {
  const doc = readDoc("demo/ANDY_SYNTHETIC_DEMO.md");
  if (doc === "") return;
  assert.match(doc, /pre-launch, synthetic only/i);
});

test("docs honesty: demo script synthetic demo note is not WCAG verified", () => {
  const doc = readDoc("demo/ANDY_SYNTHETIC_DEMO.md");
  if (doc === "") return;
  assert.match(doc, /not mean the site is releasable/i);
});