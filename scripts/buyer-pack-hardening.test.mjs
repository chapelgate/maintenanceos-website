import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/buyers/page.tsx"), "utf8");
const routes = fs.readFileSync(path.join(ROOT, "src/config/routes.ts"), "utf8");

test("buyer pack hardening: does not claim cyber certifications", () => {
  assert.doesNotMatch(page, /Cyber Essentials/i);
  assert.doesNotMatch(page, /ISO 27001/i);
  assert.doesNotMatch(page, /SOC 2/i);
});

test("buyer pack hardening: does not claim G-Cloud or DOS listing", () => {
  assert.doesNotMatch(page, /G-Cloud/i);
  assert.doesNotMatch(page, /Digital Outcomes/i);
  assert.doesNotMatch(page, /DOS /i);
});

test("buyer pack hardening: does not show live host or deployment details", () => {
  assert.doesNotMatch(page, /ondigitalocean\.app/);
  assert.doesNotMatch(page, /deployment/i);
  assert.doesNotMatch(page, /prod /i);
});

test("buyer pack hardening: company number matches records", () => {
  assert.match(page, /12340004/);
  assert.match(page, /Chapelgate Limited/);
});

test("buyer pack hardening: all claims are synthetic demo only", () => {
  assert.match(page, /synthetic demo/i);
  assert.match(page, /pre-launch/i);
});

test("buyer pack hardening: routes config keeps buyers hidden from nav", () => {
  assert.doesNotMatch(routes, /\/buyers\//);
});