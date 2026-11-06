import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const adminPage = read("src/app/admin/page.tsx");
const dashboardPage = read("src/app/dashboard/page.tsx");

// New: admin page documents pre-launch/internal-only nature honestly
test("admin page documents pre-launch internal-only nature honestly", () => {
  assert.match(adminPage, /Pre-launch|pre-launch/);
  assert.match(adminPage, /internal/i);
  assert.match(adminPage, /Not a public page/);
  assert.match(adminPage, /no customer records/i);
  assert.match(adminPage, /fails closed/);
});

// New: admin page shows flag status without claiming live operational KPIs
test("admin page does not claim live operational KPIs", () => {
  assert.doesNotMatch(adminPage, /uptime is|SLA is|99\.\d%/);
  assert.match(adminPage, /No customer records or operational KPIs are shown/);
});

// New: admin page has noindex (already in metadata)
test("admin page has noindex robots meta", () => {
  assert.match(adminPage, /robots.*index: false/);
});

// New: dashboard page documents pre-launch nature
test("dashboard page documents pre-launch nature honestly", () => {
  assert.ok(dashboardPage.includes("pre-launch") || dashboardPage.includes("Pre-launch") ||
           dashboardPage.includes("synthetic") || dashboardPage.includes("preview"));
});

// New: dashboard page does not claim live dashboard
test("dashboard page does not claim live dashboard", () => {
  assert.doesNotMatch(dashboardPage, /live dashboard/i);
  assert.doesNotMatch(dashboardPage, /operational dashboard/i);
  assert.doesNotMatch(dashboardPage, /customer records|live data/i);
});

// New: admin/dashboard recovery nav to trust/security
test("admin page includes trust/security recovery links", () => {
  assert.ok(adminPage.includes('/trust/') && adminPage.includes('/security/'),
    "admin page missing trust/security recovery links");
});

test("dashboard page includes trust/security recovery links", () => {
  assert.ok(dashboardPage.includes('/trust/') && dashboardPage.includes('/security/'),
    "dashboard page missing trust/security recovery links");
});