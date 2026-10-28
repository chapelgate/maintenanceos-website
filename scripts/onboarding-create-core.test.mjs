import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/onboarding-create-core.ts"), "utf8");

test("onboarding-create-core exports ReceptionistDraft type", () => {
  assert.match(src, /export type ReceptionistDraft/);
});

test("onboarding-create-core exports EMPTY_RECEPTIONIST_DRAFT constant", () => {
  assert.match(src, /export const EMPTY_RECEPTIONIST_DRAFT/);
});

test("onboarding-create-core exports isValidEmail function", () => {
  assert.match(src, /export function isValidEmail/);
});

test("onboarding-create-core exports CreateJourneyStep type", () => {
  assert.match(src, /export type CreateJourneyStep/);
});

test("onboarding-create-core exports CreateScanProgress type", () => {
  assert.match(src, /export type CreateScanProgress/);
});

test("onboarding-create-core exports CREATE_JOURNEY_STEPS constant", () => {
  assert.match(src, /export const CREATE_JOURNEY_STEPS/);
});
