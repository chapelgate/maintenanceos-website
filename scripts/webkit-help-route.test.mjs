import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const a11y = fs.readFileSync(
  path.join(ROOT, "tests/webkit-a11y/a11y.test.mjs"),
  "utf8",
);

test("webkit a11y pages include the public help index", () => {
  assert.match(a11y, /'\/help\/'/);
  assert.match(a11y, /browserName: 'webkit'/);
});

test("help index page exists for the webkit route", () => {
  assert.ok(fs.existsSync(path.join(ROOT, "src/app/help/page.tsx")));
});
