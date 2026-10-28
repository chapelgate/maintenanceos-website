import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/onboarding-create.ts"), "utf8");

test("onboarding-create exports createScanProgressTitle function", () => {
  assert.match(src, /export function createScanProgressTitle/);
});

test("onboarding-create exports emptyHoursOrServicesNote function", () => {
  assert.match(src, /export function emptyHoursOrServicesNote/);
});

test("onboarding-create exports hostnameBusinessHint function", () => {
  assert.match(src, /export function hostnameBusinessHint/);
});

test("onboarding-create exports mapScanResponse function", () => {
  assert.match(src, /export function mapScanResponse/);
});

test("onboarding-create exports DraftFieldMeta type", () => {
  assert.match(src, /export type DraftFieldMeta/);
});

test("onboarding-create exports ScanDraftFieldMeta type", () => {
  assert.match(src, /export type ScanDraftFieldMeta/);
});

test("onboarding-create exports ScanBusinessFacts type", () => {
  assert.match(src, /export type ScanBusinessFacts/);
});

test("onboarding-create exports ScanBusinessFactKey type", () => {
  assert.match(src, /export type ScanBusinessFactKey/);
});

test("onboarding-create exports ScanSiteKnowledgeItem type", () => {
  assert.match(src, /export type ScanSiteKnowledgeItem/);
});

test("onboarding-create exports FIELD_META_SOURCE_LABELS constant", () => {
  assert.match(src, /export const FIELD_META_SOURCE_LABELS/);
});

test("onboarding-create exports scanFieldReviewHint function", () => {
  assert.match(src, /export function scanFieldReviewHint/);
});

test("onboarding-create exports mapScanFieldMeta function", () => {
  assert.match(src, /export function mapScanFieldMeta/);
});

test("onboarding-create exports mapScanBusinessFacts function", () => {
  assert.match(src, /export function mapScanBusinessFacts/);
});
