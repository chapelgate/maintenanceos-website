import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/receptionist-draft.ts"), "utf8");

test("receptionist-draft re-exports buildReceptionistDraft", () => {
  assert.match(src, /buildReceptionistDraft/);
});

test("receptionist-draft re-exports buildSystemPrompt", () => {
  assert.match(src, /buildSystemPrompt/);
});

test("receptionist-draft re-exports finalizeSystemPrompt", () => {
  assert.match(src, /finalizeSystemPrompt/);
});

test("receptionist-draft re-exports limitationsFor", () => {
  assert.match(src, /limitationsFor/);
});

test("receptionist-draft re-exports normalizeKnowledgePack", () => {
  assert.match(src, /normalizeKnowledgePack/);
});

test("receptionist-draft re-exports overlayReceptionistDraft", () => {
  assert.match(src, /overlayReceptionistDraft/);
});

test("receptionist-draft re-exports parseFaqs", () => {
  assert.match(src, /parseFaqs/);
});

test("receptionist-draft re-exports parseServices", () => {
  assert.match(src, /parseServices/);
});

test("receptionist-draft re-exports MAX_PROMPT", () => {
  assert.match(src, /MAX_PROMPT/);
});

test("receptionist-draft re-exports TRUSTED_CONSTRAINTS_MARKER", () => {
  assert.match(src, /TRUSTED_CONSTRAINTS_MARKER/);
});

test("receptionist-draft re-exports TRUSTED_SANDBOX_CONSTRAINTS", () => {
  assert.match(src, /TRUSTED_SANDBOX_CONSTRAINTS/);
});

test("receptionist-draft re-exports DraftFieldKey type", () => {
  assert.match(src, /DraftFieldKey/);
});

test("receptionist-draft re-exports KnowledgeFaq type", () => {
  assert.match(src, /KnowledgeFaq/);
});

test("receptionist-draft re-exports KnowledgePack type", () => {
  assert.match(src, /KnowledgePack/);
});

test("receptionist-draft re-exports SiteKnowledgeItem type", () => {
  assert.match(src, /SiteKnowledgeItem/);
});

test("receptionist-draft re-exports ReceptionistDraftInput type", () => {
  assert.match(src, /ReceptionistDraftInput/);
});

test("receptionist-draft re-exports ReceptionistDraftResult type", () => {
  assert.match(src, /ReceptionistDraftResult/);
});
