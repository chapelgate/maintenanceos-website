import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("subprocessors page has content page metadata", () => {
  const page = read("src/app/subprocessors/page.tsx");
  assert.ok(page.includes("contentPageMetadata"));
  assert.ok(page.includes('title: "Subprocessors"'));
  assert.ok(page.includes('path: "/subprocessors/"'));
  assert.ok(page.includes('Draft planned subprocessor register'));
});

test("subprocessors page has PageHero with honest lede", () => {
  const page = read("src/app/subprocessors/page.tsx");
  assert.match(page, /Draft planned register/);
  assert.match(page, /Pending legal review/);
  assert.match(page, /not a live Twilio, SendGrid, or Google processing claim/);
  assert.match(page, /pre-launch marketing site/);
});

test("subprocessors page has honest description of no live phone", () => {
  const page = read("src/app/subprocessors/page.tsx");
  assert.match(page, /not operate a live phone line/);
});