import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/agent-review.ts"), "utf8");

test("agent-review exports AGENT_REVIEW_VERSION", () => {
  assert.match(src, /export const AGENT_REVIEW_VERSION/);
});

test("agent-review exports AgentReviewRequirementKind", () => {
  assert.match(src, /export type AgentReviewRequirementKind/);
});

test("agent-review exports AgentReviewRequirement", () => {
  assert.match(src, /export type AgentReviewRequirement/);
});

test("agent-review exports AgentReviewRecord", () => {
  assert.match(src, /export type AgentReviewRecord/);
});

test("agent-review exports ReviewedIdentityDraft", () => {
  assert.match(src, /export type ReviewedIdentityDraft/);
});

test("agent-review exports AgentReviewSubject", () => {
  assert.match(src, /export type AgentReviewSubject/);
});

test("agent-review exports agentReviewRevision function", () => {
  assert.match(src, /export function agentReviewRevision/);
});

test("agent-review exports reviewSourceLabel function", () => {
  assert.match(src, /export function reviewSourceLabel/);
});

test("agent-review exports reviewFactHint function", () => {
  assert.match(src, /export function reviewFactHint/);
});

test("agent-review exports identityDraftFromBlueprint function", () => {
  assert.match(src, /export function identityDraftFromBlueprint/);
});
