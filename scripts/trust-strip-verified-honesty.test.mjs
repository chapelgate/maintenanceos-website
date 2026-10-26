import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const strip = fs.readFileSync(path.join(ROOT, "src/components/HomeTrustStrip.tsx"), "utf8");

test("home trust strip does not claim Verified Architecture certification theatre", () => {
  assert.match(strip, /Architecture rules:/);
  assert.match(strip, /Rules own safety/);
  assert.match(strip, /Pre-launch/);
  assert.doesNotMatch(strip, /Verified Architecture/);
  assert.doesNotMatch(strip, /certified/i);
});

test("home trust strip keeps no-live-phone honesty", () => {
  assert.match(strip, /No live phone on this site/);
  assert.doesNotMatch(strip, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
