import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("create flow honesty: steps reference interactive demo and pre-launch", () => {
  const page = read("src/app/create/page.tsx");
  assert.match(page, /interactive receptionist demo|synthetic/i);
});

test("create flow honesty: form does not create live phone calls or bookings", () => {
  const form = read("src/components/CreateReceptionistForm.tsx");
  assert.match(form, /does not place a telephone call/);
  assert.doesNotMatch(form, /book a call/i);
});

test("create flow honesty: later steps code-split", () => {
  const later = read("src/components/CreateReceptionistLaterSteps.tsx");
  assert.match(later, /next\/dynamic|ssr:\s*false/i);
});

test("create flow honesty: ingest privacy note mentions data collection", () => {
  const note = read("src/components/CreateIngestPrivacyNote.tsx");
  assert.match(note, /privacy|data collection|how we use/i);
});

test("create flow honesty: funnel islands feature-flagged", () => {
  const enabled = read("src/components/create-funnel-islands.enabled.tsx");
  assert.match(enabled, /feature flag|toggle|enabled/i);
});