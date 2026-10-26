import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("demo honesty line keeps live-number denial on one matchable line", () => {
  const page = fs.readFileSync(path.join(ROOT, "src/app/demo/page.tsx"), "utf8");
  assert.match(page, /does not assign a live number/);
  assert.doesNotMatch(page, /does not assign a live\n/);
});

test("contact honesty keeps live support-desk denial", () => {
  const page = fs.readFileSync(path.join(ROOT, "src/app/contact/page.tsx"), "utf8");
  assert.match(page, /not a live support desk/i);
  assert.match(page, /no invented response SLA/i);
  assert.doesNotMatch(page, /we reply within/i);
});
