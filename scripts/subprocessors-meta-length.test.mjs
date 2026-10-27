import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/subprocessors/page.tsx"), "utf8");

test("subprocessors metadata description stays within 160 characters", () => {
  const match = page.match(/export const metadata = contentPageMetadata\(\{[\s\S]*?description:\s*\n\s*"([^"]+)"/);
  assert.ok(match, "metadata description not found");
  assert.ok(match[1].length <= 160, `description is ${match[1].length}: ${match[1]}`);
  assert.match(match[1], /Pending legal review/);
  assert.match(match[1], /not a live/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
