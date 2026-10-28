import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/agent-blueprint.ts"), "utf8");

test("agent-blueprint exports AGENT_BLUEPRINT_SCHEMA_VERSION", () => {
  assert.match(src, /export const AGENT_BLUEPRINT_SCHEMA_VERSION/);
});

test("agent-blueprint exports AGENT_BLUEPRINT_PRODUCT_BASELINE_SHA", () => {
  assert.match(src, /export const AGENT_BLUEPRINT_PRODUCT_BASELINE_SHA/);
});

test("agent-blueprint exports AGENT_BLUEPRINT_PRODUCT_BASELINE_DATE", () => {
  assert.match(src, /export const AGENT_BLUEPRINT_PRODUCT_BASELINE_DATE/);
});

test("agent-blueprint exports AGENT_TYPES constant", () => {
  assert.match(src, /export const AGENT_TYPES/);
});

test("agent-blueprint exports AGENT_CAPABILITIES constant", () => {
  assert.match(src, /export const AGENT_CAPABILITIES/);
});

test("agent-blueprint exports INTEGRATION_KINDS constant", () => {
  assert.match(src, /export const INTEGRATION_KINDS/);
});

test("agent-blueprint exports AgentType type", () => {
  assert.match(src, /export type AgentType/);
});
