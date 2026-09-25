import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("home renders the commercial proof section", () => {
  const home = read("src/app/page.tsx");
  assert.match(home, /CommercialProof/);
  assert.match(home, /<CommercialProof \/>/);
  assert.match(home, /<UkScenarioVignettes \/>/);
});

test("commercial proof reuses the signed VERIFIED inventory", () => {
  const proof = read("src/components/CommercialProof.tsx");
  assert.match(proof, /phoneAiMarketingCards\.filter/);
  assert.match(proof, /card\.status === "VERIFIED"/);
  assert.match(proof, /FeatureStatusChip status="VERIFIED"/);
  assert.doesNotMatch(proof, /const verifiedCapabilities = \[/);
});

test("reliability wording is evidence-bounded", () => {
  const proof = read("src/components/CommercialProof.tsx");
  assert.match(proof, /10 September 2026/);
  assert.match(proof, /full[\s\S]*pytest pass/);
  assert.match(proof, /SQLite backup\/restore/);
  assert.match(proof, /Cloud CI and Security CI[\s\S]*baseline pass/);
  assert.match(proof, /not an uptime percentage, latency[\s\S]*SLA/);
  assert.doesNotMatch(proof, /99\.9|99\.99|ms latency|second response/i);
});

test("pilot proof slot forbids fabricated social proof", () => {
  const proof = read("src/components/CommercialProof.tsx");
  assert.match(proof, /Awaiting publishable evidence/);
  assert.match(proof, /named evidence source/);
  assert.match(proof, /permission to publish/);
  assert.match(proof, /claims review/);
  assert.match(proof, /No invented uptime, testimonials, customer logos, awards/);
});

test("trust routes cover security privacy and human review", () => {
  const proof = read("src/components/CommercialProof.tsx");
  assert.match(proof, /href: "\/security\//);
  assert.match(proof, /href: "\/privacy\//);
  assert.match(proof, /href: "\/how-it-works\//);
  assert.match(proof, /Critical safety[\s\S]*authorised human review/);
  assert.match(proof, /no client-money execution authority/);
});
