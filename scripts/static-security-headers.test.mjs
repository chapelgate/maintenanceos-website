import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/static-security-headers.ts"), "utf8");

test("static-security-headers exports REFERRER_POLICY", () => {
  assert.match(src, /REFERRER_POLICY/);
});

test("static-security-headers exports DESIRED_HTTP_HEADERS", () => {
  assert.match(src, /DESIRED_HTTP_HEADERS/);
});

test("static-security-headers exports contentSecurityPolicy", () => {
  assert.match(src, /contentSecurityPolicy/);
});

test("static-security-headers exports CONTENT_SECURITY_POLICY", () => {
  assert.match(src, /CONTENT_SECURITY_POLICY/);
});

test("static-security-headers CSP includes frame-ancestors self", () => {
  assert.match(src, /frame-ancestors/);
  assert.match(src, /'self'/);
});
