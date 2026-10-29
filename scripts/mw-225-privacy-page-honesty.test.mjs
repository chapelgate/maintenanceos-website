import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("privacy page has draft status declared", () => {
  const privacy = read("src/app/privacy/page.tsx");
  assert.match(privacy, /Draft/);
  assert.match(privacy, /pending legal review/);
  assert.match(privacy, /not final policy/);
});

test("privacy page has honest scope declaration", () => {
  const privacy = read("src/app/privacy/page.tsx");
  assert.match(privacy, /applies to the pre-launch marketing website only/);
  assert.match(privacy, /does not describe future product or app-account processing/);
});

test("privacy page has honest ICO registration status", () => {
  const privacy = read("src/app/privacy/page.tsx");
  assert.match(privacy, /ICO registration: pending counsel confirmation/);
  assert.match(privacy, /number not published on this draft notice/);
});

test("privacy page categories-only data collection claim", () => {
  const privacy = read("src/app/privacy/page.tsx");
  assert.match(privacy, /Categories only until verified/);
  assert.doesNotMatch(privacy, /We collect.*without qualification/);
  assert.doesNotMatch(privacy, /Categories only until verified.*and we/);
});

test("privacy page has honest third-party sharing claims", () => {
  const privacy = read("src/app/privacy/page.tsx");
  assert.match(privacy, /No third-party analytics vendor is used/);
  assert.match(privacy, /pending legal review/);
});

test("privacy page references subprocessors and cookies pages", () => {
  const privacy = read("src/app/privacy/page.tsx");
  assert.match(privacy, /\/subprocessors\//);
  assert.match(privacy, /\/cookies\//);
});

test("privacy page has legal draft banner and chrome", () => {
  const privacy = read("src/app/privacy/page.tsx");
  assert.match(privacy, /LegalDraftBanner/);
  assert.match(privacy, /LegalPageChrome/);
});

test("privacy page metadata structure is valid", () => {
  const privacy = read("src/app/privacy/page.tsx");
  assert.ok(privacy.includes("export const metadata"));
  assert.ok(privacy.includes('title: "Privacy Policy (Draft)"'));
  assert.ok(privacy.includes('path: "/privacy/"'));
});