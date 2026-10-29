import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("how-we-keep-control page has content page metadata", () => {
  const page = read("src/app/how-we-keep-control/page.tsx");
  assert.ok(page.includes("contentPageMetadata"));
  assert.ok(page.includes('title: "The safety rules, written down"'));
  assert.ok(page.includes('path: "/how-we-keep-control/"'));
  assert.ok(page.includes('AI assists with intake'));
});

test("how-we-keep-control page has PageHero with honest lede", () => {
  const page = read("src/app/how-we-keep-control/page.tsx");
  assert.ok(page.includes('AI assists with intake'));
  assert.ok(page.includes('Fixed server rules control'));
  assert.ok(page.includes('Authorised people clear dangerous repairs'));
  assert.ok(page.includes('Not a live latch runtime'));
});

test("how-we-keep-control page has Gas Emergency banner", () => {
  const page = read("src/app/how-we-keep-control/page.tsx");
  assert.ok(page.includes('If you smell gas'));
  assert.ok(page.includes('Carbon monoxide'));
  assert.ok(page.includes('National Gas Emergency Service'));
});

test("how-we-keep-control page has Core Pillars section", () => {
  const page = read("src/app/how-we-keep-control/page.tsx");
  assert.ok(page.includes('auditable evidence'));
  assert.ok(page.includes('Tenant isolation'));
  assert.ok(page.includes('Checkpoint test verification'));
});

test("how-we-keep-control page has CTA to demo", () => {
  const page = read("src/app/how-we-keep-control/page.tsx");
  assert.ok(page.includes('CtaPair'));
  assert.ok(page.includes('Request an early demo'));
});