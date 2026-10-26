import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("home trust strip pins claims to checkpoint, not live deployment count", () => {
  const strip = fs.readFileSync(path.join(ROOT, "src/components/HomeTrustStrip.tsx"), "utf8");
  assert.match(strip, /Claims evidence pinned to audited checkpoint/);
  assert.doesNotMatch(strip, /196 automated claims tests passed/);
});

test("how-we-keep-control avoids presenting 196 as a live per-deployment gate", () => {
  const page = fs.readFileSync(path.join(ROOT, "src/app/how-we-keep-control/page.tsx"), "utf8");
  assert.match(page, /Checkpoint test verification \(pinned product evidence\)/);
  assert.match(page, /Safety claims and test counts are pinned to the audited product checkpoint/);
  assert.doesNotMatch(page, /Every deployment must pass 196 automated safety/);
});

test("product evidence register still pins the audited 196 checkpoint evidence", () => {
  const register = fs.readFileSync(path.join(ROOT, "PRODUCT_CLAIMS_REGISTER.md"), "utf8");
  assert.match(register, /498ad82dd87631814195d447d89458480b117951/);
  assert.match(register, /196 passed \/ 0 failed/);
});
