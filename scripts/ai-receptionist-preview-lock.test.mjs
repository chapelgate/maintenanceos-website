import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(
  path.join(ROOT, "src/app/ai-receptionist/page.tsx"),
  "utf8",
);

test("ai receptionist page stays preview and not a live commercial phone", () => {
  assert.match(page, /Not a live voice service/);
  assert.match(page, /not a live commercial phone service/i);
  assert.match(page, /Controlled voice preview undergoing testing/);
  assert.match(page, /not commercial general availability/i);
  assert.match(page, /Live-carrier retest is still required/);
  assert.doesNotMatch(page, /Available 24\/?7/i);
  assert.doesNotMatch(page, /call now/i);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("ai receptionist transfer claims stay explicit-request and under retest", () => {
  assert.match(page, /transfer is explicit-request-only/i);
  assert.match(page, /Transfer quality is still under retest/);
  assert.doesNotMatch(page, /immediately transfers/i);
});
