import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const widget = fs.readFileSync(
  path.join(ROOT, "src/components/ChatWidget.tsx"),
  "utf8",
);
const unit = fs.readFileSync(
  path.join(ROOT, "src/components/ChatWidget.test.tsx"),
  "utf8",
);

test("chat widget has no fake submit or delivery theatre", () => {
  assert.doesNotMatch(widget, /setStatus\("success"\)/);
  assert.doesNotMatch(widget, /setStatus\("submitting"\)/);
  assert.doesNotMatch(widget, /onSubmit/);
  assert.doesNotMatch(widget, /<form/);
  assert.doesNotMatch(widget, /type="submit"/);
  assert.doesNotMatch(widget, /placeholder/);
  assert.match(widget, /Online chat is not connected on this static site/);
  assert.match(widget, /No message is\s+delivered from this panel/);
  assert.match(widget, /Chat is not connected/);
  assert.match(widget, /Open chat availability/);
  assert.doesNotMatch(widget, /Chat with us/);
  assert.doesNotMatch(widget, /reply to your email/i);
});

test("chat widget unit expectations match the honesty panel", () => {
  assert.match(unit, /Chat is not connected/);
  assert.match(unit, /no fake submit form/i);
  assert.match(unit, /!html\.includes\("<form"\)/);
  assert.doesNotMatch(unit, /aria-label="Message"/);
  assert.doesNotMatch(unit, /has proper form structure/);
});
