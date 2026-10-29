import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("terms page has draft status declared", () => {
  const terms = read("src/app/terms/page.tsx");
  assert.match(terms, /Draft/);
  assert.match(terms, /[Pp]ending legal review/);
  assert.match(terms, /not binding policy/);
});

test("terms page has honest pre-launch declaration", () => {
  const terms = read("src/app/terms/page.tsx");
  assert.match(terms, /Pre-launch and no reliance/);
  assert.match(terms, /site is pre-launch and informational/);
  assert.match(terms, /content may change/);
});

test("terms page has honest ICO registration and company data", () => {
  const terms = read("src/app/terms/page.tsx");
  assert.match(terms, /Chapelgate Limited/);
  assert.match(terms, /company number 12340004/);
  assert.match(terms, /registered office/);
});

test("terms page has honest IP and third-party claims", () => {
  const terms = read("src/app/terms/page.tsx");
  assert.match(terms, /Pending counsel review/);
  assert.match(terms, /IP ownership, marks, branding/);
  assert.match(terms, /Links to external sites are for convenience and do not imply endorsement/);
});

test("terms page references privacy and cookies pages", () => {
  const terms = read("src/app/terms/page.tsx");
  assert.match(terms, /\/privacy\//);
  assert.match(terms, /\/cookies\//);
});

test("terms page has legal draft banner and chrome", () => {
  const terms = read("src/app/terms/page.tsx");
  assert.match(terms, /LegalDraftBanner/);
  assert.match(terms, /LegalPageChrome/);
});

test("terms page metadata structure is valid", () => {
  const terms = read("src/app/terms/page.tsx");
  assert.ok(terms.includes("export const metadata"));
  assert.ok(terms.includes('title: "Terms (Draft)"'));
  assert.ok(terms.includes('path: "/terms/"'));
});