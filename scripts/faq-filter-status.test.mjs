import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(
  path.join(ROOT, "src/components/FaqAccordion.tsx"),
  "utf8",
);

test("FAQ filter announces a live result count", () => {
  assert.match(src, /id="faq-result-count"/);
  assert.match(src, /role="status"/);
  assert.match(src, /aria-live="polite"/);
  assert.match(src, /matching question/);
  assert.match(src, /aria-describedby="faq-result-count"/);
});

test("FAQ empty filter offers a clear-action recovery path", () => {
  assert.match(src, /data-no-results/);
  assert.match(src, /Clear FAQ filter/);
  assert.match(src, /setSearchQuery\(""\)/);
  assert.match(src, /clear the filter to show every question again/);
  assert.doesNotMatch(src, /browse all questions below/);
  assert.doesNotMatch(src, /£/);
  assert.doesNotMatch(src, /buy now/i);
});
