import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const route = fs.readFileSync(
  path.join(ROOT, "src/app/blog/rss.xml/route.ts"),
  "utf8",
);

test("blog RSS channel description aligns with release/status denials", () => {
  assert.match(route, /Not commercially generally available/);
  assert.match(route, /Not a public always-on phone line/);
  assert.match(route, /No SLA claim/);
  assert.match(route, /\/release\.json/);
  assert.match(route, /\/status\.json/);
  assert.match(route, /Pre-launch insights/);
  assert.doesNotMatch(route, /(?<!Not )commercially generally available/);
  assert.doesNotMatch(route, /live always-on phone service is available/i);
  assert.doesNotMatch(route, /response-time SLA guaranteed/i);
  assert.doesNotMatch(route, /£/);
});
