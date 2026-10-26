import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/features/page.tsx"), "utf8");

test("features bento reframes absolute claims as designed/source controls", () => {
  assert.match(page, /Designed-for timestamped logs of intake events and clearance decisions for compliance \(product source\)/);
  assert.match(page, /Designed strict database partitioning for tenant isolation \(product source\)/);
  assert.doesNotMatch(page, /Timestamped logs of every intake event and clearance decision for compliance/);
  assert.doesNotMatch(page, /Strict database partitioning ensures zero cross-organisation data exposure/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
});