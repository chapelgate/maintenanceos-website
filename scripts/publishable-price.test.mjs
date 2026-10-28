import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/publishable-price.ts"), "utf8");

test("publishable-price exports isPublishablePriceLabel function", () => {
  assert.match(src, /export function isPublishablePriceLabel/);
});
