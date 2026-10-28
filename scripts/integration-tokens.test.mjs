import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/integration-tokens.ts"), "utf8");

test("integration-tokens exports TokenData interface", () => {
  assert.match(src, /export interface TokenData/);
});

test("integration-tokens exports TokenStore interface", () => {
  assert.match(src, /export interface TokenStore/);
});

test("integration-tokens exports MemoryTokenStore class", () => {
  assert.match(src, /export class MemoryTokenStore/);
});

test("integration-tokens exports getEncryptionKey function", () => {
  assert.match(src, /export async function getEncryptionKey/);
});

test("integration-tokens exports setEncryptionKey function", () => {
  assert.match(src, /export function setEncryptionKey/);
});

test("integration-tokens exports encryptToken function", () => {
  assert.match(src, /export async function encryptToken/);
});

test("integration-tokens exports decryptToken function", () => {
  assert.match(src, /export async function decryptToken/);
});

test("integration-tokens exports getTokenStore function", () => {
  assert.match(src, /export function getTokenStore/);
});

test("integration-tokens exports isTokenExpired function", () => {
  assert.match(src, /export function isTokenExpired/);
});
