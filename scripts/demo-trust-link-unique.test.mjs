import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/demo/page.tsx"), "utf8");

test("demo page has exactly one demo-trust-link id", () => {
  const ids = page.match(/id="demo-trust-link"/g) || [];
  assert.equal(ids.length, 1);
  const labelled = page.match(/aria-labelledby="demo-trust-link"/g) || [];
  assert.equal(labelled.length, 1);
});

test("demo recovery section still links Trust Help Contact Security", () => {
  assert.match(page, /Related pre-launch pages/);
  assert.match(page, /href="\/trust\/"/);
  assert.match(page, /href="\/help\/"/);
  assert.match(page, /href="\/contact\/"/);
  assert.match(page, /href="\/security\/"/);
  assert.match(page, /not a live support desk/);
});
