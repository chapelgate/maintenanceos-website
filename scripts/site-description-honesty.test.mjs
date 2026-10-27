import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = fs.readFileSync(path.join(ROOT, "src/config/site.ts"), "utf8");

test("siteConfig.description denies GA, live phone, and SLA", () => {
  assert.match(site, /description:\s*"[^"]*Pre-launch/);
  assert.match(site, /not commercially generally available/);
  assert.match(site, /not a public always-on phone/);
  assert.match(site, /no SLA claim/);
  assert.doesNotMatch(site, /description:\s*"[^"]*£/);
  assert.doesNotMatch(site, /SLA guaranteed/i);
});
