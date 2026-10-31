import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("admin page declares pre-launch internal state honestly", () => {
  const page = fs.readFileSync(path.join(ROOT, "src/app/admin/page.tsx"), "utf8");
  assert.match(page, /Internal.*Pre-launch/);
  assert.match(page, /NEXT_PUBLIC_PUBLIC_LAUNCH=false/);
  assert.match(page, /coming soon/);
  assert.match(page, /not connected/);
  assert.match(page, /placeholder labels only/);
  assert.match(page, /retired host disabled/);
  assert.match(page, /not configured/);
  assert.match(page, /630.*630 pass/);
  assert.match(page, /mw-1023-01-licences/);
  assert.match(page, /mw-1024-01-estate-meta/);
  assert.match(page, /index: false/);
});

test("admin page has no live customer data claims", () => {
  const page = fs.readFileSync(path.join(ROOT, "src/app/admin/page.tsx"), "utf8");
  assert.doesNotMatch(page, /live customer/);
  assert.doesNotMatch(page, /production metric/);
  assert.doesNotMatch(page, /real.*data/);
});

test("admin page is excluded from sitemap routes", () => {
  const routes = fs.readFileSync(path.join(ROOT, "src/config/routes.ts"), "utf8");
  assert.doesNotMatch(routes, /"\/admin\/"/);
});
