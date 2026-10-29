import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/help/page.tsx"), "utf8");

test("mw-190: help page declares pre-launch synthetic demo", () => {
  assert.match(page, /Pre-launch synthetic demo/);
  assert.match(page, /nothing here is a live customer portal/);
});

test("mw-190: help page keeps content page metadata", () => {
  assert.match(page, /generateMetadata/);
  assert.match(page, /contentPageMetadata/);
});
