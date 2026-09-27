import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("Step 6 rejects stale async configuration edits", () => {
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");

  assert.match(later, /configEditVersionRef = useRef\(0\)/);
  assert.match(later, /const editVersion = \+\+configEditVersionRef\.current/);
  assert.ok(
    (later.match(/editVersion !== configEditVersionRef\.current/g) || []).length >= 3,
  );
  assert.match(later, /configEditVersionRef\.current \+= 1/);
});

test("Step 6 invalidates confirmations and stale provenance after edits", () => {
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");

  assert.match(later, /setReviewConfirmedIds\(\[\]\)/);
  assert.match(later, /delete next\.businessName/);
  assert.match(later, /delete next\.locations/);
  assert.match(later, /delete next\.contact/);
  assert.match(later, /setFieldMeta\(\{\}\)/);
  assert.match(later, /if \(current\.website\) next\.website = current\.website/);
  assert.match(later, /if \(current\.locations\) next\.locations = current\.locations/);
  assert.match(later, /if \(current\.contact\) next\.contact = current\.contact/);
});

test("accepted pack edits regenerate the exact system prompt", () => {
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");

  assert.match(later, /buildAgentSystemPrompt/);
  assert.match(later, /setPromptText\(regeneratedPrompt\)/);
  assert.match(later, /systemPrompt: regeneratedPrompt/);
  assert.doesNotMatch(
    later,
    /systemPrompt:\s*configurationLib\.finalizeAgentSystemPrompt\(\s*promptText/,
  );
});
