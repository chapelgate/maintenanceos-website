import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("how-it-works matches the /create stepper labels", () => {
  const flow = read("src/components/HowItWorksFlow.tsx");
  const page = read("src/app/how-it-works/page.tsx");
  const create = read("src/lib/onboarding-create.ts");

  assert.match(create, /label: "Website"/);
  assert.match(create, /label: "Check"/);
  assert.match(create, /label: "Review"/);
  assert.match(create, /label: "Pack"/);

  assert.match(flow, /CREATE_JOURNEY_STEPS/);
  assert.match(flow, /Website → Check → Review → Pack/);
  assert.match(flow, /do not invent extracted hours/);
  assert.match(flow, /scripted sandbox demo is under testing/);
  assert.match(flow, /not a live customer call/i);
  assert.doesNotMatch(flow, /always-on service/);

  assert.match(page, /Website → Check → Review → Pack/);
  assert.match(page, /scripted sandbox/);
  assert.match(page, /live phone number/);
  assert.match(page, /Create from website/);
  assert.doesNotMatch(page, /commercially generally available/i);
});

test("features cards separate HAVE / UNDER TEST / COMING", () => {
  const page = read("src/app/features/page.tsx");
  assert.match(page, /heading: "HAVE"/);
  assert.match(page, /heading: "UNDER TEST"/);
  assert.match(page, /heading: "COMING"/);
  assert.match(page, /Website → Check → Review → Pack/);
  assert.match(page, /Pack-aware scripted sandbox/);
  assert.match(page, /Calendar connect/);
  assert.match(page, /Live always-on customer phone/);
  assert.match(page, /Not a live receptionist or a 30-second phone number/);
  assert.doesNotMatch(page, /commercially generally available/i);
});

test("static export setting is unchanged", () => {
  const config = read("next.config.ts");
  assert.match(config, /output:\s*["']export["']/);
});

test("home CTA strip names the website-to-pack path", () => {
  const page = read("src/app/page.tsx");
  assert.match(page, /website URL/);
  assert.match(page, /knowledge pack/);
  assert.match(page, /scripted sandbox/);
  assert.match(page, /Create from website/);
  assert.match(page, /No live phone demo/);
});

test("Fonio matrix notes marketing pages had lagged the create funnel", () => {
  const matrix = read("docs/competitive/fonio-parity-matrix.md");
  assert.match(matrix, /Were lagging/);
  assert.match(matrix, /Website → Check → Review → Pack/);
  assert.match(matrix, /HAVE \/ UNDER TEST \/ COMING/);
  assert.match(matrix, /narrative aligned; still not a live phone/);
});
