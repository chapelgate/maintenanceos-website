import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const post = fs.readFileSync(
  path.join(ROOT, "src/content/blog/structured-repair-intake-vs-free-text-forms.mdx"),
  "utf8",
);

test("structured-repair blog does not imply published response SLAs", () => {
  assert.match(post, /mapped to urgency grades for human review/);
  assert.match(post, /not a published response SLA/);
  assert.doesNotMatch(post, /mapped to response SLAs/);
  assert.doesNotMatch(post, /24\/7 always/i);
  assert.doesNotMatch(post, /commercially generally available/i);
});

test("structured-repair blog keeps latch clearance as human judgement", () => {
  assert.match(post, /Safety Latches Hold for Human Clearance/);
  assert.match(post, /Coordinator judgement is still required to clear a latch/);
  assert.match(post, /Not a live latch runtime on this marketing site/);
  assert.match(post, /Audit Evidence by Design/);
  assert.match(post, /Not a live audit suite on this marketing site/);
  assert.doesNotMatch(post, /Safety Latches Apply Automatically/);
  assert.doesNotMatch(post, /without coordinator judgement/);
  assert.doesNotMatch(post, /Audit Evidence by Default/);
  assert.doesNotMatch(post, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
