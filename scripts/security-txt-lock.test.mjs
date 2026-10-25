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
  assert.doesNotMatch(txt, /bounty/i);
  assert.doesNotMatch(txt, /response.?time/i);
  assert.doesNotMatch(txt, /£/);
});
