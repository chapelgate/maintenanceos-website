import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/admin/page.tsx"), "utf8");
const routes = fs.readFileSync(path.join(ROOT, "src/config/routes.ts"), "utf8");

test("admin page reads live siteConfig flags", () => {
  assert.match(page, /siteConfig\.publicLaunch/);
  assert.match(page, /siteConfig\.calendarAdaptersEnabled/);
  assert.match(page, /siteConfig\.sandboxTestCallEnabled/);
  assert.match(page, /siteConfig\.customerDashboardEnabled/);
  assert.match(page, /siteConfig\.demoPhoneNumber/);
  assert.match(page, /siteConfig\.formEndpoint/);
  assert.match(page, /siteConfig\.measurementEndpoint/);
  assert.match(page, /data-admin-flag="publicLaunch"/);
  assert.match(page, /Internal — Pre-launch/);
  assert.match(page, /index: false/);
});

test("admin page stays honest about pre-launch limits", () => {
  assert.match(page, /coming soon/);
  assert.match(page, /not connected/);
  assert.match(page, /placeholder labels only/);
  assert.match(page, /retired host disabled/);
  assert.match(page, /mw-1023-01-licences/);
  assert.match(page, /mw-1024-01-estate-meta/);
  assert.doesNotMatch(page, /live customer/);
  assert.doesNotMatch(page, /production metric/);
  assert.doesNotMatch(page, /WCAG 2\.2 AA verified/);
});

test("admin page is excluded from public sitemap routes", () => {
  assert.doesNotMatch(routes, /"\/admin\/"/);
  assert.match(routes, /No admin/);
});
