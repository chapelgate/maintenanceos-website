import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("performance hardening: next.config.ts outputs static export", () => {
  const config = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  assert.match(config, /output:\s*["']export["']/);
});

test("performance hardening: error boundary does not leak stack traces", () => {
  const errorPage = fs.readFileSync(path.join(ROOT, "src/app/error.tsx"), "utf8");
  assert.doesNotMatch(errorPage, /stack\s*=/i);
  assert.doesNotMatch(errorPage, /process\.stack/i);
});

test("performance hardening: layout has no google fonts api", () => {
  const layout = fs.readFileSync(path.join(ROOT, "src/app/layout.tsx"), "utf8");
  assert.doesNotMatch(layout, /fonts\.googleapis\.com/);
});

test("performance hardening: no dynamic imports of admin-only modules", () => {
  const config = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  assert.doesNotMatch(config, /ssr:\s*true.*admin|admin.*ssr:\s*true/i);
});