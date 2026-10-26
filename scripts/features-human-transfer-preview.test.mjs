import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/features/page.tsx"), "utf8");

test("features human-transfer card stays UNDER_TEST preview honest", () => {
  assert.match(page, /id: "human-transfer"/);
  assert.match(page, /status: "UNDER_TEST"/);
  assert.match(page, /UNDER_TEST preview: explicit-request person transfer/);
  assert.match(page, /not a live always-on transfer desk on this site/);
  assert.doesNotMatch(page, /Transfers to your team on request; fails safe if unreachable/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
});
