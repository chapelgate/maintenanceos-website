import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(
  path.join(ROOT, "src/content/help/api-quickstart.mdx"),
  "utf8",
);

test("api quickstart does not invent official SDK package names", () => {
  assert.match(page, /No official SDK package is published/i);
  assert.match(page, /Not a live SDK/i);
  assert.doesNotMatch(page, /@maintenanceos\/sdk/);
  assert.doesNotMatch(page, /npm install @maintenanceos/);
  assert.doesNotMatch(page, /pip install maintenanceos/);
  assert.doesNotMatch(page, /github\.com\/maintenanceos\/go-sdk/);
  assert.doesNotMatch(page, /Official SDKs \(pre-launch, request access\)/);
});

test("api quickstart does not invent follow-on API doc routes or live webhooks", () => {
  assert.match(page, /Not a live API/i);
  assert.match(page, /Sample only: a published webhook host is not available/i);
  assert.doesNotMatch(page, /Receive real-time updates instead of polling/);
  assert.doesNotMatch(page, /\.\/api-reference/);
  assert.doesNotMatch(page, /\.\/webhook-events/);
  assert.doesNotMatch(page, /\.\/api-rate-limits/);
  assert.doesNotMatch(page, /\.\/sandbox-guide/);
  assert.doesNotMatch(page, /\.\/api-migration/);
});
