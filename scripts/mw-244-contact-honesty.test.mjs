import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("contact page has content page metadata", () => {
  const page = read("src/app/contact/page.tsx");
  assert.ok(page.includes("contentPageMetadata"));
  assert.ok(page.includes('title: "Contact"'));
  assert.ok(page.includes('path: "/contact/"'));
  assert.ok(page.includes('Direct enquiries'));
});

test("contact page has PageHero with honest lede", () => {
  const page = read("src/app/contact/page.tsx");
  assert.match(page, /Pre-launch/);
  assert.match(page, /Not a live support desk and not a GA support desk/);
  assert.match(page, /no monitored support phone/);
  assert.match(page, /no live chat/);
  assert.match(page, /not live phone provisioning/);
  assert.match(page, /no response-time SLA/);
});

test("contact page has direct email", () => {
  const page = read("src/app/contact/page.tsx");
  assert.match(page, /info@chapelgatetechnologies.com/);
});

test("contact page has honest form labels", () => {
  const page = read("src/app/contact/page.tsx");
  assert.match(page, /Human enquiry only/);
  assert.match(page, /not a live support desk/);
  assert.match(page, /not a GA support desk/);
  assert.match(page, /not live phone provisioning/);
  assert.match(page, /no monitored support phone/);
  assert.match(page, /no live chat/);
  assert.match(page, /no response-time SLA/);
});

test("contact page has no published SLA", () => {
  const page = read("src/app/contact/page.tsx");
  assert.match(page, /No published response-time turnaround/);
  assert.match(page, /no response-time SLA/);
  assert.match(page, /no invented response SLA/);
});