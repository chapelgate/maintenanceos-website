import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/status/page.tsx"), "utf8");

test("status page forbids live uptime and SLA badges", () => {
  assert.match(page, /no public production service/i);
  assert.match(page, /not a live status page/i);
  assert.match(page, /does not publish an uptime figure/i);
  assert.match(page, /No fake uptime charts, incident timelines, or SLA badges/);
  assert.match(page, /index: false/);
  assert.doesNotMatch(page, /99\.\d%/);
  assert.doesNotMatch(page, /uptime guarantee/i);
  assert.doesNotMatch(page, /live status dashboard/i);
});

test("status page stays a pre-launch placeholder", () => {
  assert.match(page, /eyebrow="Placeholder"/);
  assert.match(page, /This page is a placeholder/);
  assert.match(page, /future status page would cover/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /£/);
});

test("status page links trust, security, help and contact without ops-desk claims", () => {
  assert.match(page, /href="\/trust\/"/);
  assert.match(page, /href="\/security\/"/);
  assert.match(page, /href="\/help\/"/);
  assert.match(page, /href="\/contact\/"/);
  assert.match(page, /scanner remains frozen/);
  assert.match(page, /not a live ops desk/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /99\.\d%/);
});
