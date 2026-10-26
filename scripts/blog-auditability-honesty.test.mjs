import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const blog = path.join(ROOT, "src/content/blog");

test("why-safety-latches does not claim live auditability", () => {
  const body = fs.readFileSync(
    path.join(blog, "why-safety-latches-matter-in-ai-receptionists.mdx"),
    "utf8",
  );
  assert.match(body, /Auditability is design intent in product source/);
  assert.match(body, /not a live audit export claimed on this static site/);
  assert.doesNotMatch(body, /Every step is auditable\./);
  assert.doesNotMatch(body, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("regulations blog does not claim a live audit trail product export", () => {
  const body = fs.readFileSync(
    path.join(blog, "uk-maintenance-regulations-what-property-teams-need-to-know.mdx"),
    "utf8",
  );
  assert.match(body, /design-intent audit evidence in source/);
  assert.match(body, /not a live audit export on this site/);
  assert.doesNotMatch(body, /Gas Safe\/NICEIC clearance → audit trail$/m);
});

test("landscape blog marks subprocessors as draft and auditability as design intent", () => {
  const body = fs.readFileSync(
    path.join(blog, "uk-property-maintenance-software-landscape-2026.mdx"),
    "utf8",
  );
  assert.match(body, /Pre-launch draft processing stance/);
  assert.match(body, /Draft subprocessor register \(pre-launch\)/);
  assert.match(body, /auditability is design intent/);
  assert.doesNotMatch(body, /UK-only processing; published subprocessors at \/subprocessors\//);
  assert.doesNotMatch(body, /\| \*\*Data Transparency\*\* \| Privacy policy only \| Published subprocessor list \|/);
  assert.doesNotMatch(body, /Rule-based, auditable, human clearance/);
});
