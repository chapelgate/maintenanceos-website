import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/agent-configuration.ts"), "utf8");

test("agent-configuration exports TRUSTED_AGENT_CONTROL_MARKER", () => {
  assert.match(src, /export const TRUSTED_AGENT_CONTROL_MARKER/);
});

test("agent-configuration exports UNTRUSTED_BUSINESS_DATA_MARKER", () => {
  assert.match(src, /export const UNTRUSTED_BUSINESS_DATA_MARKER/);
});

test("agent-configuration exports finalizeAgentSystemPrompt", () => {
  assert.match(src, /export function finalizeAgentSystemPrompt/);
});

test("agent-configuration exports buildAgentSystemPrompt", () => {
  assert.match(src, /export function buildAgentSystemPrompt/);
});

test("agent-configuration exports applyKnowledgePackToAgentBlueprint", () => {
  assert.match(src, /export function applyKnowledgePackToAgentBlueprint/);
});

test("agent-configuration exports agentLimitationsFor", () => {
  assert.match(src, /export function agentLimitationsFor/);
});
