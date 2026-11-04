import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/cookies/page.tsx"), "utf8");
const stub = fs.readFileSync(path.join(ROOT, "src/components/CookieSettingsStub.tsx"), "utf8");

test("cookies page keeps draft wording and cookieless-first-party-only claims", () => {
  assert.match(page, /Cookie Policy \(Draft\)/);
  assert.match(page, /Pending legal review/);
  assert.match(page, /cookieless operational measurement/);
  assert.match(page, /stores only your consent choice in local storage/);
  assert.match(page, /uses no cookies/);
  assert.match(page, /Not a compliance certification/);
  assert.doesNotMatch(page, /Google Analytics certified/);
  assert.doesNotMatch(page, /PECR certified/);
  assert.doesNotMatch(page, /we are GDPR certified/i);
});

test("cookie settings controls stay draft-honest", () => {
  assert.match(stub, /Current choice/);
  assert.match(stub, /local storage/);
  assert.match(stub, /no analytics or marketing cookies or tags/);
  assert.match(stub, /pending legal confirmation/i);
  assert.doesNotMatch(stub, /always rejects non-essential cookies/);
});
