import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/help/page.tsx"), "utf8");

test("help filter announces live result count", () => {
  assert.match(page, /id="help-result-count"/);
  assert.match(page, /role="status"/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /matching article/);
  assert.match(page, /aria-describedby="help-result-count"/);
});

test("help empty filter offers clear filter recovery path", () => {
  assert.match(page, /data-no-results/);
  assert.match(page, /Clear help filter/);
  assert.match(page, /searchInput\.value = ''/);
  assert.match(page, /applyFilter\(''\)/);
  assert.match(page, /Clear the filter to show every article again/);
  assert.match(page, /Clear the filter/);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /buy now/i);
});

test("help section is role=search", () => {
  assert.match(page, /section aria-labelledby="search-heading" className="mb-8" role="search"/);
});
