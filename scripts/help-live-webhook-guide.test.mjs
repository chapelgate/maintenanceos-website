import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HELP = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src/content/help");
const guide = fs.readFileSync(path.join(HELP, "webhook-guide.mdx"), "utf8");

test("webhook guide does not publish live webhooks, signatures, events, or a sandbox", () => {
  assert.doesNotMatch(guide, /At-least-once delivery/);
  assert.doesNotMatch(guide, /Retries/);
  assert.doesNotMatch(guide, /Timeout/);
  assert.doesNotMatch(guide, /Dead letter/);
  assert.doesNotMatch(guide, /Example \(Node\.js\)/);
  assert.doesNotMatch(guide, /Example \(Python\)/);
  assert.doesNotMatch(guide, /Events available:/);
  assert.doesNotMatch(guide, /Sandbox workspace/);
  assert.match(guide, /not a live webhook/i);
  assert.match(guide, /not a live verification method/i);
  assert.match(guide, /not a live consumer pattern/i);
  assert.match(guide, /not a live API/i);
  assert.match(guide, /Not a live setup/i);
  assert.match(guide, /Not a live dashboard/i);
});
