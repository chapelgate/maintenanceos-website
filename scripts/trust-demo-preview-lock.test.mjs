import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/trust/page.tsx"), "utf8");

test("trust voice section labels demo number as preview not live 24/7", () => {
  const compact = page.replace(/\s+/g, " ");
  assert.match(page, /Voice Demo — Browser Sandbox & Preview Number/);
  assert.match(page, /Preview demo number \(when enabled\)/);
  assert.match(compact, /not a public 24\s*\/\s*7 answering service/i);
  assert.match(compact, /not a live always-on phone/i);
  assert.doesNotMatch(page, /Live demo number \(when enabled\)/);
  assert.doesNotMatch(page, /Available\s+24\s*\/\s*7 for greeting/i);
  assert.doesNotMatch(page, /Browser-Only & Live Number/);
  assert.doesNotMatch(page, /via a live demo phone number/i);
  assert.match(page, /preview demo phone number/i);
});

test("trust voice section does not call the demo a live number store path", () => {
  assert.match(page, /The preview number does not store/);
  assert.doesNotMatch(page, /The live number does not store/);
  assert.doesNotMatch(page, /pipeline as the live demo/);
});
