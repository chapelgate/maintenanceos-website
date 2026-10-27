import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(
  path.join(ROOT, "src/components/ChatWidget.tsx"),
  "utf8",
);

test("ChatWidget Escape closes the dialog and returns focus to the trigger", () => {
  assert.match(src, /event\.key !== ["']Escape["']/);
  assert.match(src, /document\.addEventListener\(["']keydown["']/);
  assert.match(src, /triggerRef\.current\?\.focus\(\)/);
  assert.match(src, /closeRef\.current\?\.focus\(\)/);
  assert.match(src, /aria-expanded=\{isOpen\}/);
  assert.match(src, /Online chat is not connected on this static site/);
  assert.doesNotMatch(src, /fetch\(["']\/api\/chat/);
  assert.doesNotMatch(src, /<form\b/);
});

test("ChatWidget keeps the trigger mounted while open for focus return", () => {
  assert.match(src, /hidden=\{isOpen\}/);
  assert.match(src, /aria-label=\"Open chat\"/);
  assert.doesNotMatch(src, /\{!isOpen \? \(/);
});
