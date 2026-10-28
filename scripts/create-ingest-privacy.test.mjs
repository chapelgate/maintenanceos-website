import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/create-ingest-privacy.ts"), "utf8");

test("create-ingest-privacy exports CREATE_INGEST_PRIVACY_DRAFT_LABEL", () => {
  assert.match(src, /CREATE_INGEST_PRIVACY_DRAFT_LABEL/);
});

test("create-ingest-privacy exports CREATE_INGEST_PRIVACY_HEADING", () => {
  assert.match(src, /CREATE_INGEST_PRIVACY_HEADING/);
});

test("create-ingest-privacy exports CREATE_INGEST_PRIVACY_ANCHOR", () => {
  assert.match(src, /CREATE_INGEST_PRIVACY_ANCHOR/);
});

test("create-ingest-privacy exports CREATE_INGEST_PRIVACY_NOTE", () => {
  assert.match(src, /CREATE_INGEST_PRIVACY_NOTE/);
});
