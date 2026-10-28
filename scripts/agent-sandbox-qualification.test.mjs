import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/agent-sandbox-qualification.ts"), "utf8");

test("agent-sandbox-qualification exports AGENT_SANDBOX_QUALIFICATION_VERSION", () => {
  assert.match(src, /export const AGENT_SANDBOX_QUALIFICATION_VERSION/);
});

test("agent-sandbox-qualification exports AgentSandboxSource type", () => {
  assert.match(src, /export type AgentSandboxSource/);
});

test("agent-sandbox-qualification exports AgentSandboxQualificationResult type", () => {
  assert.match(src, /export type AgentSandboxQualificationResult/);
});

test("agent-sandbox-qualification exports buildAgentSandboxQualificationRecord", () => {
  assert.match(src, /export function buildAgentSandboxQualificationRecord/);
});

test("agent-sandbox-qualification exports finalizeAgentSandboxQualification", () => {
  assert.match(src, /export function finalizeAgentSandboxQualification/);
});

test("agent-sandbox-qualification exports qualifyAgentSandbox", () => {
  assert.match(src, /export function qualifyAgentSandbox/);
});

test("agent-sandbox-qualification exports qualificationMatchesReview", () => {
  assert.match(src, /export function qualificationMatchesReview/);
});
