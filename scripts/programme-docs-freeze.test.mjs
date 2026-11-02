import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const name of [
  "WEBSITE_TEST_RESULTS.md",
  "WEBSITE_AGENT_BOARD.md",
  "MAINTENANCEOS_WEBSITE_FINAL_REPORT.md",
]) {
  test(`${name} exists with non-launch honesty`, () => {
    const text = fs.readFileSync(path.join(ROOT, name), "utf8");
    assert.ok(text.length > 200);
    assert.match(text, /not.*launch|NOT A PUBLIC LAUNCH|does \*\*not\*\* claim|PARKED|pre-launch/i);
    assert.doesNotMatch(text, /NEXT_PUBLIC_PUBLIC_LAUNCH\s*=\s*true/);
  });
}
