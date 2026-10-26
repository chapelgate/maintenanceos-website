import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const post = fs.readFileSync(
  path.join(ROOT, "src/content/blog/ai-voice-demo-browser-only-what-it-means.mdx"),
  "utf8",
);

test("voice demo blog does not invent a published public API", () => {
  assert.match(post, /Not a published public API/);
  assert.match(post, /authorised preview endpoints when those endpoints are configured/);
  assert.doesNotMatch(post, /via our API for the voice components/);
});

test("voice demo blog does not invent retention or free-trial guarantees", () => {
  assert.match(post, /Not a verified retention claim/);
  assert.match(post, /No published price or free-trial promise/);
  assert.match(post, /Not a commercial offer/);
  assert.doesNotMatch(post, /No data retained after session ends/);
  assert.doesNotMatch(post, /Free during pre-launch testing/);
  assert.doesNotMatch(post, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(post, /buy now/i);
});
