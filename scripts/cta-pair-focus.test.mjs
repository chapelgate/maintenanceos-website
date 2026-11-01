import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/components/CtaPair.tsx"), "utf8");

test("CtaPair primary and secondary expose focus-visible rings", () => {
  assert.match(src, /focus-visible:ring-2/);
  assert.match(src, /focus-visible:ring-accent/);
  assert.match(src, /focus:outline-none/);
  assert.equal((src.match(/focus-visible:ring-2/g) || []).length >= 2, true);
});
