import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/cookies/page.tsx"), "utf8");

test("cookies page replaces [ANDY:] placeholders with pending-counsel wording", () => {
  assert.match(page, /No cookies are currently named — pending counsel\s+confirmation if any are introduced/);
  assert.match(page, /default off until consent &mdash; none currently/);
  assert.match(
    page,
    /Pending counsel confirmation — version and date practice for material updates not yet set/,
  );
  assert.doesNotMatch(page, /\[ANDY:/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
});
