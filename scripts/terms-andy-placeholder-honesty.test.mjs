import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/terms/page.tsx"), "utf8");
const chrome = fs.readFileSync(path.join(ROOT, "src/components/LegalPageChrome.tsx"), "utf8");

test("terms page replaces [ANDY:] placeholders with pending-counsel wording", () => {
  assert.match(page, /Pending counsel review: IP ownership, marks, branding, and limited licence terms not yet final/);
  assert.match(page, /Pending counsel review: indemnity clause decision pending/);
  assert.match(page, /Pending counsel review: how updates take effect will be set once a final version exists/);
  assert.doesNotMatch(page, /\[ANDY: IP ownership, marks, branding, and limited licence terms per counsel review\.\]/);
  assert.doesNotMatch(page, /\[ANDY: include or omit indemnity clause\]/);
  assert.doesNotMatch(page, /\[ANDY: how updates take effect and are communicated once a final version exists, per counsel review\.\]/);
  assert.match(page, /Draft/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
});

test("legal chrome drops [ANDY:] effective-date placeholder", () => {
  assert.match(chrome, /Pending counsel review — effective date not yet set for this draft/);
  assert.doesNotMatch(chrome, /\[ANDY: effective \/ last-updated date\]/);
  assert.doesNotMatch(chrome, /\[ANDY:/);
});
