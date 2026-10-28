import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/agent-customer-configuration.ts"), "utf8");

test("agent-customer-configuration exports CUSTOMER_VOICE_PROFILES", () => {
  assert.match(src, /export const CUSTOMER_VOICE_PROFILES/);
});

test("agent-customer-configuration exports CustomerVoiceProfile type", () => {
  assert.match(src, /export type CustomerVoiceProfile/);
});

test("agent-customer-configuration exports CustomerActionId type", () => {
  assert.match(src, /export type CustomerActionId/);
});

test("agent-customer-configuration exports CustomerAgentConfiguration type", () => {
  assert.match(src, /export type CustomerAgentConfiguration/);
});

test("agent-customer-configuration exports CustomerActionOption type", () => {
  assert.match(src, /export type CustomerActionOption/);
});

test("agent-customer-configuration exports customerActionOptionsForBlueprint", () => {
  assert.match(src, /export function customerActionOptionsForBlueprint/);
});

test("agent-customer-configuration exports customerTransferSupported", () => {
  assert.match(src, /export function customerTransferSupported/);
});
