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
  assert.match(read("src/app/how-it-works/page.tsx"), /<UkScenarioVignettes \/>/);
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
  const security = read("src/app/security/page.tsx");
  assert.match(proof, /What.s live today/);
  assert.match(security, /10 September 2026/);
  assert.match(security, /full automated test pass/);
  assert.match(security, /backup and restore check/);
  assert.match(security, /build checks and security checks passed/);
  assert.match(security, /not an uptime percentage, latency[\s\S]*SLA/);
  assert.doesNotMatch(proof + security, /99\.9|99\.99|ms latency|second response/i);
});

test("pilot proof slot forbids fabricated social proof", () => {
  const proof = read("src/components/CommercialProof.tsx");
  assert.match(proof, /named evidence source/);
  assert.match(proof, /permission to publish/);
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
