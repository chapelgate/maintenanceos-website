import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/vulnerability-disclosure/page.tsx"), "utf8");

test("mw-191: vulnerability disclosure page declares pre-launch synthetic demo", () => {
  assert.match(page, /Pre-launch synthetic demo/);
  assert.match(page, /no production system is exposed here/);
});

test("mw-191: vulnerability disclosure page keeps honest no-SLA declaration", () => {
  assert.match(page, /does not publish a/);
  assert.match(page, /response-time SLA/);
});
