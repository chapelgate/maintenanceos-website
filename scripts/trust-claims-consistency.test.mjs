import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/trust/page.tsx"), "utf8");
const register = fs.readFileSync(path.join(ROOT, "PRODUCT_CLAIMS_REGISTER.md"), "utf8");

test("/trust/ claims map to claims-register entries", () => {
  const compact = page.replace(/\s+/g, " ");
  const registerCompact = register.replace(/\s+/g, " ");

  const claims = [
    {
      id: "R-01",
      label: "not commercially generally available / pre-launch",
      pageTest: () =>
        assert.match(compact, /pre-launch|not commercially generally available/),
      registerTest: () => assert.match(registerCompact, /R-01/),
    },
    {
      id: "S-05",
      label: "no certifications held",
      pageTest: () => assert.match(compact, /We do not hold and do not claim/),
      registerTest: () => assert.match(registerCompact, /S-05/),
    },
    {
      id: "V-07",
      label: "controlled carrier voice not proven",
      pageTest: () => assert.match(compact, /Not a live always-on phone/),
      registerTest: () => assert.match(registerCompact, /V-07/),
    },
    {
      id: "V-04",
      label: "explicit caller-request human transfer",
      pageTest: () =>
        assert.match(compact, /explicit|human transfer|legal basis|consent/),
      registerTest: () => assert.match(registerCompact, /V-04/),
    },
    {
      id: "O-04",
      label: "authorised human clearance for safety",
      pageTest: () =>
        assert.match(compact, /Authorised human clearance|Legal basis|explicit consent/),
      registerTest: () => assert.match(registerCompact, /O-04/),
    },
    {
      id: "O-01",
      label: "multi-tenant maintenance operations system",
      pageTest: () =>
        assert.match(compact, /Chapelgate Limited|registered in England/),
      registerTest: () => assert.match(registerCompact, /O-01/),
    },
  ];

  for (const { id, label, pageTest, registerTest } of claims) {
    pageTest();
    registerTest();
  }
});

test("/trust/ does not claim commercially live voice or production GA", () => {
  assert.doesNotMatch(page, /is a live always-on phone service/);
  assert.doesNotMatch(page, /is a production answering service/);
  assert.doesNotMatch(page, /commercially generally available now/);
});

test("/trust/ voice demo framing is browser-only / pre-launch", () => {
  assert.match(page, /runs entirely in the browser/);
  assert.match(page, /browser&apos;s Web Speech API/);
  assert.match(page, /Not a live always-on phone/);
});