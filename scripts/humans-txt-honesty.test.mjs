import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const humans = fs.readFileSync(path.join(ROOT, "public/humans.txt"), "utf8");

test("humans.txt states pre-launch denials and the real enquiry address", () => {
  assert.match(humans, /Not commercially generally available/i);
  assert.match(humans, /Not a public always-on phone line/i);
  assert.match(humans, /No SLA claim/i);
  assert.match(humans, /info@chapelgatetechnologies\.com/);
  assert.match(humans, /\/release\.json/);
  assert.match(humans, /\/status\.json/);
  assert.match(humans, /\/create\//);
  assert.match(humans, /\/demo\//);
  assert.match(humans, /\/vulnerability-disclosure\//);
  assert.match(humans, /Not a GA support desk/i);
  assert.match(humans, /No response-time SLA/i);
  assert.doesNotMatch(humans, /security@worksmartos\.co\.uk/);
  assert.doesNotMatch(humans, /product@worksmartos\.co\.uk/);
  assert.doesNotMatch(humans, /contact@worksmartos\.co\.uk/);
  assert.doesNotMatch(humans, /SLA guaranteed/i);
  assert.doesNotMatch(humans, /£/);
});
