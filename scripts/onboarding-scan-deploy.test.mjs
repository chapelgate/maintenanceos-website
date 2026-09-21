import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("render.yaml is marked legacy and is not the scan deploy path", () => {
  const yaml = read("render.yaml");
  assert.match(yaml, /LEGACY \/ DO NOT USE/);
  assert.match(yaml, /do not apply this Blueprint/i);
  assert.match(yaml, /docs\/ONBOARDING_SCAN_DEPLOY\.md/);
  assert.match(yaml, /docs\/STAGING_COMPANIONS\.md/);
  assert.match(yaml, /Not a DigitalOcean App Platform spec/);
  assert.match(yaml, /Not maintenanceos-redteam/);
  assert.match(yaml, /name:\s*maintenanceos-onboarding-scan/);
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
  assert.doesNotMatch(docker, /^ENV ONBOARDING_WEB_INGEST=/m);
  assert.match(docker, /DigitalOcean App Platform/);
  assert.match(docker, /maintenanceos-redteam/);
});

test("deploy runbook documents droplet, systemd or docker, health, CORS, and DO rebuild", () => {
  const doc = read("docs/ONBOARDING_SCAN_DEPLOY.md");
  assert.match(doc, /DigitalOcean droplet/);
  assert.match(doc, /do not use Render/i);
  assert.match(doc, /systemd/);
  assert.match(doc, /packages\/onboarding-ingest\/Dockerfile/);
  assert.match(doc, /PORT/);
  assert.match(doc, /ONBOARDING_WEB_INGEST/);
  assert.match(doc, /GET \/health/);
  assert.match(doc, /POST \/v1\/onboarding\/scan/);
  assert.match(doc, /seahorse-app-4oasq\.ondigitalocean\.app/);
  assert.match(doc, /ONBOARDING_SCAN_CORS_ORIGIN/);
  assert.match(doc, /NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT/);
  assert.match(doc, /Force Rebuild/);
  assert.match(doc, /SSRF/);
  assert.match(doc, /maintenanceos-redteam/);
  assert.match(doc, /output: 'export'/);
  assert.doesNotMatch(doc, /dashboard\.render\.com/);
  assert.doesNotMatch(doc, /onrender\.com/);
});

test("next.config static export is unchanged by the companion deploy path", () => {
  const text = read("next.config.ts");
  assert.match(text, /output:\s*["']export["']/);
});
