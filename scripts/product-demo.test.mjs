import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("home has a prominent see-it-work path", () => {
  const home = read("src/app/page.tsx");
  assert.match(home, /secondaryHref="\/demo\/#see-it-work"/);
  assert.match(home, /secondaryLabel="See it work"/);
});

test("demo page reuses the shared proof wrapper", () => {
  const page = read("src/app/demo/page.tsx");
  assert.match(page, /DemoProof/);
  assert.match(page, /<DemoProof \/>/);
});

test("proof wrapper reuses existing tour dashboard and supervisor shell", () => {
  const proof = read("src/components/DemoProof.tsx");
  assert.match(proof, /id="see-it-work"/);
  assert.match(proof, /<ProductTour \/>/);
  assert.match(proof, /<CustomerDashboard demoMode \/>/);
  assert.match(proof, /<ProductUiShell \/>/);
  assert.match(proof, /Sample call to summary to controlled workflow/);
  assert.match(proof, /fictional SAMPLE data/);
  assert.match(proof, /not.*live customer call/i);
});

test("public demo forces the existing local SAMPLE catalogue only", () => {
  const dashboard = read("src/components/CustomerDashboard.tsx");
  assert.match(dashboard, /demoMode = false/);
  assert.match(dashboard, /siteConfig\.customerDashboardEnabled \|\| demoMode/);
  assert.match(dashboard, /demoMode \? "" : siteConfig\.customerDashboardEndpoint\.trim\(\)/);
  assert.match(dashboard, /setSelectedId\(sessionOutcome\.data\.sessions\[0\]\.id\)/);
  assert.match(dashboard, /existing labelled in-browser SAMPLE catalogue/);
});

test("demo adds no third-party tour or waveform dependency", () => {
  const pkg = read("package.json");
  assert.doesNotMatch(pkg, /driver\.js|shepherd|wavesurfer/i);
});
