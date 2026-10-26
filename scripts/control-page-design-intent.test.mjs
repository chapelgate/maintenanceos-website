import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(
  path.join(ROOT, "src/app/how-we-keep-control/page.tsx"),
  "utf8",
);

test("control page frames logging as product design intent, not live site ops", () => {
  assert.match(page, /Product design intent: caller interaction/);
  assert.match(page, /does not itself operate live call logging/);
  assert.doesNotMatch(page, /is permanently logged with timestamps/);
  assert.doesNotMatch(page, /provide complete traceability for statutory compliance/);
});

test("control page frames tenant isolation as product design, not live marketing DB", () => {
  assert.match(page, /Product design intent: organisation data is partitioned/);
  assert.match(page, /does not host multi-tenant customer data/);
  assert.doesNotMatch(page, /Data is strictly partitioned by organisation ID at the database layer/);
});
