import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const humans = fs.readFileSync(
  path.join(ROOT, "public/humans.txt"),
  "utf8",
);

test("humans.txt includes pre-launch honesty markers and contact references", () => {
  assert.match(humans, /not commercially generally available/i);
  assert.match(humans, /not a public always-on phone line/i);
  assert.match(humans, /no SLA claim/i);
  assert.match(humans, /security@worksmartos\.co\.uk/);
  assert.match(humans, /product@worksmartos\.co\.uk/);
  assert.match(humans, /contact@worksmartos\.co\.uk/);
  assert.match(humans, /\/status\.json/);
  assert.match(humans, /\/release\.json/);
  assert.match(humans, /\/create\//);
  assert.match(humans, /\/demo\//);
  assert.match(humans, /\/vulnerability-disclosure\//);
  assert.match(humans, /terms.*draft/i);
  assert.match(humans, /privacy.*draft/i);
  assert.match(humans, /cookies.*draft/i);
  assert.doesNotMatch(humans, /(?<!not )commercially generally available\./i);
  assert.doesNotMatch(humans, /always-on phone line is live/i);
  assert.doesNotMatch(humans, /SLA guaranteed/i);
  assert.doesNotMatch(humans, /£/);
});