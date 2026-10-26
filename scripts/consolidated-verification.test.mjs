import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

test("consolidated verification passes every non-test-suite gate on exact HEAD SHA", async () => {
  const result = execFileSync("node", ["scripts/consolidated-verification.mjs"], {
    encoding: "utf8",
    stdio: "pipe",
    timeout: 600000,
  });
  assert.match(result, /HEAD: [0-9a-f]{40}/);
  assert.match(result, /build\] PASS/);
  assert.match(result, /full test suite\] PASS/);
  assert.match(result, /eslint\] PASS/);
  assert.match(result, /typecheck \(sample\)\] PASS/);
  assert.match(result, /security:live \(non-strict\)\] PASS/);
  assert.match(result, /performance:budget\] PASS/);
  assert.match(result, /accessibility:check\] PASS/);
  assert.match(result, /functional:smoke\] PASS/);
  assert.match(result, /release-marker-sha\] PASS/);
  assert.match(result, /OVERALL: PASS/);
});
