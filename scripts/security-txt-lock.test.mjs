import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const txt = fs.readFileSync(
  path.join(ROOT, "public/.well-known/security.txt"),
  "utf8",
);

test("security.txt keeps Contact, Expires, and no bounty promise", () => {
  assert.match(txt, /^Contact:\s*mailto:info@chapelgatetechnologies\.com$/m);
  assert.match(txt, /^Expires:\s*20\d{2}-/m);
  assert.match(txt, /^Canonical:\s*https:\/\/worksmartos\.co\.uk\/\.well-known\/security\.txt$/m);
  assert.doesNotMatch(txt, /(?<!No bug )bounty/i);
  assert.doesNotMatch(txt, /(?<!No )response.?time(?! SLA)/i);
  assert.doesNotMatch(txt, /£/);
  assert.doesNotMatch(txt, /we (offer|pay|guarantee).{0,40}(bounty|response)/i);
});

test("security.txt states pre-launch honesty denials", () => {
  assert.match(txt, /Pre-launch synthetic demo/i);
  assert.match(txt, /Not commercially generally available/i);
  assert.match(txt, /Not a public always-on phone line/i);
  assert.match(txt, /No bug bounty/i);
  assert.match(txt, /No response-time SLA/i);
  assert.match(txt, /^Policy:\s*https:\/\/worksmartos\.co\.uk\/security\/$/m);
});
