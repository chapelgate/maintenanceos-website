import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/public-enquiry.ts"), "utf8");

test("public-enquiry exports RETIRED_LEAD_HOST", () => {
  assert.match(src, /export const RETIRED_LEAD_HOST/);
});

test("public-enquiry exports PUBLIC_ENQUIRY_EMAIL", () => {
  assert.match(src, /export const PUBLIC_ENQUIRY_EMAIL/);
});

test("public-enquiry exports ENQUIRY_UNAVAILABLE_MESSAGE", () => {
  assert.match(src, /export const ENQUIRY_UNAVAILABLE_MESSAGE/);
});

test("public-enquiry exports usableHttpEndpoint function", () => {
  assert.match(src, /export function usableHttpEndpoint/);
});

test("public-enquiry exports MAX_ENQUIRY_SUBJECT_LENGTH", () => {
  assert.match(src, /export const MAX_ENQUIRY_SUBJECT_LENGTH/);
});

test("public-enquiry exports MAX_ENQUIRY_BODY_LENGTH", () => {
  assert.match(src, /export const MAX_ENQUIRY_BODY_LENGTH/);
});

test("public-enquiry exports MAX_ENQUIRY_MAILTO_LENGTH", () => {
  assert.match(src, /export const MAX_ENQUIRY_MAILTO_LENGTH/);
});

test("public-enquiry exports BUSINESS_TYPE_LABELS", () => {
  assert.match(src, /export const BUSINESS_TYPE_LABELS/);
});

test("public-enquiry exports validateEnquiryFields function", () => {
  assert.match(src, /export function validateEnquiryFields/);
});

test("public-enquiry exports buildEnquiryMailto function", () => {
  assert.match(src, /export function buildEnquiryMailto/);
});
