import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/agent-selection.ts"), "utf8");

test("agent-selection exports AgentTemplate type", () => {
  assert.match(src, /export type AgentTemplate/);
});

test("agent-selection exports AGENT_TEMPLATES constant", () => {
  assert.match(src, /export const AGENT_TEMPLATES/);
});

test("agent-selection exports agentTemplateFor function", () => {
  assert.match(src, /export function agentTemplateFor/);
});

test("agent-selection exports agentRoleSlug function", () => {
  assert.match(src, /export function agentRoleSlug/);
});

test("agent-selection exports agentTypeFromRoleSlug function", () => {
  assert.match(src, /export function agentTypeFromRoleSlug/);
});

test("agent-selection exports buildAgentBlueprintDraft function", () => {
  assert.match(src, /export function buildAgentBlueprintDraft/);
});

test("agent-selection exports createAgentBlueprintDraft function", () => {
  assert.match(src, /export function createAgentBlueprintDraft/);
});
