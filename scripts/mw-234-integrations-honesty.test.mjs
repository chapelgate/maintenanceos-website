import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("integrations page has provider name and description", () => {
  const page = read("src/app/integrations/[provider]/page.tsx");
  assert.match(page, /config\.name/);
  assert.match(page, /config\.description/);
  assert.match(page, /Connect/);
});

test("integrations page has integration status badge", () => {
  const page = read("src/app/integrations/[provider]/page.tsx");
  assert.match(page, /Available|Coming Soon/);
});

test("integrations page has security and privacy section", () => {
  const page = read("src/app/integrations/[provider]/page.tsx");
  assert.match(page, /Security & privacy/);
  assert.match(page, /short-lived tokens/);
  assert.match(page, /minimal scopes/);
  assert.match(page, /No AES-256-GCM or live OAuth claim/);
});

test("integrations page has setup steps or planned steps", () => {
  const page = read("src/app/integrations/[provider]/page.tsx");
  assert.match(page, /Setup steps|Planned setup steps/);
  assert.match(page, /These steps describe/);
});

test("integrations page has breadcrumb navigation", () => {
  const page = read("src/app/integrations/[provider]/page.tsx");
  assert.match(page, /Integrations/);
  assert.match(page, /\/integrations\//);
});