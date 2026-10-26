import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/industries/page.tsx"), "utf8");

test("industries landlord card does not claim live out-of-hours service", () => {
  assert.match(
    page,
    /Designed for out-of-hours repair capture with emergency triage — pre-launch preview, not a live phone/,
  );
  assert.doesNotMatch(
    page,
    /landlords: "Out-of-hours repair capture with emergency triage\."/,
  );
  assert.match(page, /Pre-launch: Core safety controls are built; not a live phone/);
  assert.doesNotMatch(page, /buy now/i);
});
