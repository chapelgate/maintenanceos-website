import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("mw-195: RouteError announces pre-launch synthetic demo", () => {
  const page = read("src/app/error.tsx");
  assert.match(page, /Pre-launch/);
  assert.match(page, /WorkSmartOS is a pre-launch synthetic demo/);
  assert.match(page, /Nothing was sold, booked,/);
});

test("mw-195: RouteError does not expose stack traces", () => {
  const page = read("src/app/error.tsx");
  assert.doesNotMatch(page, /error\.stack/);
  assert.doesNotMatch(page, /process\.stack/);
});

test("mw-195: GlobalError announces pre-launch synthetic demo", () => {
  const page = read("src/app/global-error.tsx");
  assert.match(page, /Pre-launch/);
  assert.match(page, /WorkSmartOS is a pre-launch synthetic demo/);
});