import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("docs: static security baseline is claims-safe", () => {
  const doc = read("docs/security/static-security-baseline.md");
  assert.ok(doc.includes("claims-safe"));
  assert.ok(doc.includes("DigitalOcean App Platform"));
  assert.ok(doc.includes("static"));
});

test("docs: andy synthetic demo script has pre-launch disclaimer", () => {
  const doc = read("docs/demo/ANDY_SYNTHETIC_DEMO.md");
  assert.ok(doc.includes("pre-launch"));
  assert.ok(doc.includes("synthetic only"));
  assert.ok(doc.includes("Do not set NEXT_PUBLIC_PUBLIC_LAUNCH"));
});

test("docs: andy synthetic demo script prohibits golden line", () => {
  const doc = read("docs/demo/ANDY_SYNTHETIC_DEMO.md");
  assert.ok(doc.includes("golden phone line"));
  assert.ok(doc.includes("Do not call"));
  assert.ok(doc.includes("Do not enter a live customer record"));
});