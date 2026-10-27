import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/components/ChatWidget.tsx"), "utf8");
const create = fs.readFileSync(path.join(ROOT, "src/app/create/page.tsx"), "utf8");
const industry = fs.readFileSync(path.join(ROOT, "src/components/IndustryRolePage.tsx"), "utf8");

test("ChatWidget is a static not-connected panel with no fake form submit", () => {
  assert.match(src, /Online chat is not connected on this static site/);
  assert.match(src, /mailto:info@chapelgatetechnologies\.com/);
  assert.doesNotMatch(src, /<form\b/);
  assert.doesNotMatch(src, /type=["']submit["']/);
  assert.doesNotMatch(src, /fetch\(["']\/api\/chat/);
  assert.doesNotMatch(src, /placeholder\s*=/);
  assert.doesNotMatch(src, /pageContext/);
  assert.doesNotMatch(src, /setStatus\(/);
  assert.match(src, /aria-label=["']Open chat["']/);
  assert.match(src, /focus-visible:ring-2/);
});

test("ChatWidget call sites no longer pass dead pageContext props", () => {
  assert.doesNotMatch(create, /pageContext=/);
  assert.doesNotMatch(industry, /pageContext=/);
});
