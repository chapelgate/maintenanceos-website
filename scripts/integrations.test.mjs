import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/integrations.ts"), "utf8");

test("integrations exports IntegrationProviderId type", () => {
  assert.match(src, /export type IntegrationProviderId/);
});

test("integrations exports IntegrationStatus type", () => {
  assert.match(src, /export type IntegrationStatus/);
});

test("integrations exports ProviderConfig interface", () => {
  assert.match(src, /export interface ProviderConfig/);
});

test("integrations exports getOAuthCallbackBaseUrl function", () => {
  assert.match(src, /export function getOAuthCallbackBaseUrl/);
});

test("integrations exports getProviderConfig function", () => {
  assert.match(src, /export function getProviderConfig/);
});

test("integrations exports getAllProviders function", () => {
  assert.match(src, /export function getAllProviders/);
});

test("integrations exports generateAuthUrl function", () => {
  assert.match(src, /export async function generateAuthUrl/);
});

test("integrations exports isProviderAvailable function", () => {
  assert.match(src, /export function isProviderAvailable/);
});
