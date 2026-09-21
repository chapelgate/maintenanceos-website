import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("render.yaml is a free scan companion, not voice and not DigitalOcean", () => {
  const yaml = read("render.yaml");
  assert.match(yaml, /Not a DigitalOcean App Platform spec/);
  assert.match(yaml, /Not maintenanceos-redteam/);
  assert.match(yaml, /name:\s*maintenanceos-onboarding-scan/);
  assert.match(yaml, /runtime:\s*docker/);
  assert.match(yaml, /plan:\s*free/);
  assert.match(yaml, /healthCheckPath:\s*\/health/);
  assert.match(yaml, /dockerfilePath:\s*\.\/packages\/onboarding-ingest\/Dockerfile/);
  assert.match(yaml, /ONBOARDING_SCAN_HOST[\s\S]*value:\s*"0\.0\.0\.0"/);
  assert.match(yaml, /ONBOARDING_WEB_INGEST[\s\S]*value:\s*"false"/);
  assert.doesNotMatch(yaml, /name:\s*maintenanceos-redteam/);
  assert.doesNotMatch(yaml, /plan:\s*starter/i);
  assert.doesNotMatch(yaml, /SECRET|TOKEN|PASSWORD|API_KEY/);
});

test("onboarding-ingest Dockerfile matches npm run onboarding-scan", () => {
  const docker = read("packages/onboarding-ingest/Dockerfile");
  const pkg = JSON.parse(read("package.json"));
  assert.equal(
    pkg.scripts["onboarding-scan"],
    "node --experimental-strip-types packages/onboarding-ingest/src/server.ts",
  );
  assert.match(docker, /FROM node:22-bookworm-slim/);
  assert.match(
    docker,
    /CMD \["node", "--experimental-strip-types", "packages\/onboarding-ingest\/src\/server\.ts"\]/,
  );
  assert.match(docker, /ONBOARDING_SCAN_HOST=0\.0\.0\.0/);
  assert.doesNotMatch(docker, /ONBOARDING_WEB_INGEST=true/);
  assert.match(docker, /DigitalOcean App Platform/);
  assert.match(docker, /maintenanceos-redteam/);
});

test("deploy runbook documents Free click, health, CORS, SSRF, and DO rebuild", () => {
  const doc = read("docs/ONBOARDING_SCAN_DEPLOY.md");
  assert.match(doc, /Instance type:\*\* click \*\*Free\*\*/);
  assert.match(doc, /Health Check Path:\*\* `\/health`/);
  assert.match(doc, /ONBOARDING_WEB_INGEST/);
  assert.match(doc, /seahorse-app-4oasq\.ondigitalocean\.app/);
  assert.match(doc, /NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT/);
  assert.match(doc, /Force Rebuild/);
  assert.match(doc, /SSRF/);
  assert.match(doc, /maintenanceos-redteam/);
  assert.match(doc, /output: 'export'/);
  assert.match(doc, /\/v1\/onboarding\/scan/);
});

test("next.config static export is unchanged by the companion deploy path", () => {
  const text = read("next.config.ts");
  assert.match(text, /output:\s*["']export["']/);
});
