import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const banner = fs.readFileSync(
  path.join(ROOT, "src/components/PreLaunchBanner.tsx"),
  "utf8",
);

test("PreLaunchBanner denies live phone and SLA, not only commercial GA", () => {
  assert.match(banner, /not commercially generally available/i);
  assert.match(banner, /not a public always-on phone line/i);
  assert.match(banner, /no SLA claim/i);
  assert.doesNotMatch(banner, /commercially generally available\. yet\./i);
  assert.doesNotMatch(banner, /generally available yet\./);
});