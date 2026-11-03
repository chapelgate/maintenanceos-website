import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("security headers honesty does not claim CSP clickjacking or frame-ancestors", () => {
  const config = read("next.config.ts");
  assert.match(config, /static-security-headers/);
  assert.doesNotMatch(config, /frame-ancestors/);
  assert.doesNotMatch(config, /X-Frame-Options/);
});

test("next.config has no clickjacking or header host mutation", () => {
  const config = read("next.config.ts");
  assert.match(config, /output:\s*["']export["']/);
  assert.doesNotMatch(config, /frame-ancestors/);
  assert.doesNotMatch(config, /X-Frame-Options/);
  assert.doesNotMatch(config, /host.*header/i);
});

test("no clickjacking meta anywhere in app", () => {
  const app = read("src/app/layout.tsx");
  assert.doesNotMatch(app, /frame-ancestors/);
  assert.doesNotMatch(app, /X-Frame-Options/);
});