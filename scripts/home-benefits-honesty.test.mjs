import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/page.tsx"), "utf8");

test("home benefits frame capture and hazards as design intent, not live ops", () => {
  assert.match(page, /Product design intent: structured work orders/);
  assert.match(page, /when voice intake is enabled/);
  assert.match(page, /not a live always-on phone on this site/);
  assert.match(page, /Product design intent: hazard cues/);
  assert.match(page, /not a live detection service on this site/);
  assert.doesNotMatch(page, /Structured work orders from messy telephone calls\./);
  assert.doesNotMatch(page, /Automatic detection of gas, electrical danger, and leaks\./);
});

test("home benefits drop Immutable Audit Trail theatre", () => {
  assert.match(page, /Audit Trail Design/);
  assert.match(page, /Not an immutable live production guarantee on this site/);
  assert.doesNotMatch(page, /Immutable Audit Trail/);
  assert.doesNotMatch(page, /Complete evidence log for compliance and the Housing Ombudsman\./);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
});
