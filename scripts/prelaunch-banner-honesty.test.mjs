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
  assert.match(banner, /not commercially\s+generally available/i);
  assert.match(banner, /Not a public always-on phone line/);
  assert.match(banner, /No SLA claim/);
  assert.match(banner, /siteConfig\.publicLaunch/);
  assert.doesNotMatch(banner, /generally available yet\./);
  assert.doesNotMatch(banner, /£/);
});
