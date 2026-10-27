import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const layout = fs.readFileSync(path.join(ROOT, "src/app/layout.tsx"), "utf8");
const humans = fs.readFileSync(path.join(ROOT, "public/humans.txt"), "utf8");

test("root layout links humans.txt as author", () => {
  assert.match(layout, /rel="author"/);
  assert.match(layout, /href="\/humans\.txt"/);
  assert.match(layout, /type="text\/plain"/);
  assert.match(humans, /Not commercially generally available/i);
  assert.match(humans, /info@chapelgatetechnologies\.com/);
});
