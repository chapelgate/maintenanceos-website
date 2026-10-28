import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/product-tour.ts"), "utf8");

test("product-tour exports PRODUCT_TOUR constant", () => {
  assert.match(src, /export const PRODUCT_TOUR/);
});

test("product-tour declares no third-party players", () => {
  assert.match(src, /no third-party players/);
});

test("product-tour declares pre-launch", () => {
  assert.match(src, /pre-launch/);
});
