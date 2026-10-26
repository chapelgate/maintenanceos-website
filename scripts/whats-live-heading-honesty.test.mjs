import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const features = fs.readFileSync(path.join(ROOT, "src/app/features/page.tsx"), "utf8");
const proof = fs.readFileSync(path.join(ROOT, "src/components/CommercialProof.tsx"), "utf8");

test("features preview inventory heading denies GA and public phone service", () => {
  assert.match(features, /Preview capability inventory/);
  assert.doesNotMatch(features, /What's live today/);
  assert.match(features, /not commercial\s+general availability/i);
  assert.match(features, /not a public always-on phone service/i);
  assert.match(features, /Pre-launch preview|pre-launch demo/i);
  assert.doesNotMatch(features, /buy now/i);
  assert.doesNotMatch(features, /£/);
  assert.doesNotMatch(features, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("home CommercialProof preview inventory box stays pre-launch", () => {
  assert.match(proof, /Preview capability inventory/);
  assert.doesNotMatch(proof, /What's live today/);
  assert.match(proof, /not commercial general availability/i);
  assert.match(proof, /Not a public always-on phone service/i);
  assert.match(proof, /No ISO, SOC 2, or bank-grade claims/);
  assert.doesNotMatch(proof, /buy now/i);
  assert.doesNotMatch(proof, /£/);
});