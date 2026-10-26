import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/status/page.tsx"), "utf8");

test("status page keeps placeholder honesty phrases required by the uptime lock", () => {
  assert.match(page, /This page is a placeholder/);
  assert.match(page, /not a live status page/i);
  assert.match(page, /does not publish an uptime figure/i);
  assert.match(page, /No fake uptime charts, incident timelines, or SLA badges/);
  assert.doesNotMatch(page, /99\.\d%/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
});
