import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const footer = fs.readFileSync(
  path.join(ROOT, "src/components/SiteFooter.tsx"),
  "utf8",
);

test("SiteFooter denies commercial GA, live phone, and SLA", () => {
  assert.match(footer, /not commercially generally available/i);
  assert.match(footer, /Not a public always-on phone\s+line/);
  assert.match(footer, /No SLA claim/);
  assert.doesNotMatch(footer, /generally available yet\./);
  assert.doesNotMatch(footer, /£/);
});
