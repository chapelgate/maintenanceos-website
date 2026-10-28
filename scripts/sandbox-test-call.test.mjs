import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/sandbox-test-call.ts"), "utf8");

test("sandbox-test-call exports ReceptionistDraft type", () => {
  assert.match(src, /export type ReceptionistDraft/);
});

test("sandbox-test-call exports SandboxSession type", () => {
  assert.match(src, /export type SandboxSession/);
});

test("sandbox-test-call exports ScriptedTurn type", () => {
  assert.match(src, /export type ScriptedTurn/);
});

test("sandbox-test-call exports SandboxTest type", () => {
  assert.match(src, /export type SandboxTest/);
});

test("sandbox-test-call exports SandboxOutcome type", () => {
  assert.match(src, /export type SandboxOutcome/);
});

test("sandbox-test-call exports isAbsoluteHttpUrl function", () => {
  assert.match(src, /export function isAbsoluteHttpUrl/);
});

test("sandbox-test-call exports sandboxEndpointBase function", () => {
  assert.match(src, /export function sandboxEndpointBase/);
});
