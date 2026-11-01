import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const comp = fs.readFileSync(path.join(ROOT, "src/components/HomeIndustries.tsx"), "utf8");

test("industry pills meet minimum touch target size", () => {
  assert.match(comp, /min-h-11/);
  assert.match(comp, /min-w-11/);
  assert.match(comp, /focus-visible:ring-2/);
  assert.match(comp, /justify-center/);
});
