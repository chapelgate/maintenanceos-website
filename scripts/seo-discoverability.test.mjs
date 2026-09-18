import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function readPublic(name) {
  return fs.readFileSync(path.join(root, "public", name), "utf8");
}

const keyPaths = [
  "/",
  "/how-it-works/",
  "/features/",
  "/ai-receptionist/",
  "/security/",
  "/industries/",
  "/pricing/",
  "/demo/",
];

const requiredPhrases = [
  "pre-launch",
  "Join launch list",
  "Request early demo",
  "under testing",
  "not commercially",
];

const bannedPhrases = [
  "AGI",
  "overtake humans",
  "superintelligence",
  "replace all staff",
  "always-on phone number",
];

test("llms.txt exists with claims-safe conversion and key URLs", () => {
  const text = readPublic("llms.txt");
  for (const phrase of requiredPhrases) {
    assert.match(
      text,
      new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      `missing phrase: ${phrase}`,
    );
  }
  for (const p of keyPaths) {
    assert.ok(text.includes(p), `missing path ${p}`);
  }
  for (const phrase of bannedPhrases) {
    assert.equal(
      text.toLowerCase().includes(phrase.toLowerCase()),
      false,
      `banned phrase present: ${phrase}`,
    );
  }
});

test("llms-full.txt distinguishes VERIFIED / UNDER TEST / NOT CLAIMED", () => {
  const text = readPublic("llms-full.txt");
  assert.match(text, /VERIFIED/);
  assert.match(text, /UNDER TEST/);
  assert.match(text, /NOT CLAIMED/);
  assert.match(text, /Join launch list/);
  assert.match(text, /Request early demo/);
  assert.equal(text.includes("AGI"), false);
  assert.equal(/overtake humans/i.test(text), false);
});
