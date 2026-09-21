import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("render.yaml adds free sandbox + mock calendar companions, not voice", () => {
  const yaml = read("render.yaml");
  assert.match(yaml, /Not a DigitalOcean App Platform spec/);
  assert.match(yaml, /Not maintenanceos-redteam/);
  assert.match(yaml, /name:\s*maintenanceos-onboarding-scan/);
  assert.match(yaml, /name:\s*maintenanceos-sandbox-test-call/);
  assert.match(yaml, /name:\s*maintenanceos-calendar-adapters/);
  assert.match(yaml, /dockerfilePath:\s*\.\/packages\/sandbox-test-call\/Dockerfile/);
  assert.match(yaml, /dockerfilePath:\s*\.\/packages\/calendar-adapters\/Dockerfile/);
  assert.match(yaml, /SANDBOX_TEST_CALL_HOST[\s\S]*value:\s*"0\.0\.0\.0"/);
  assert.match(yaml, /SANDBOX_TEST_CALL_ENABLED[\s\S]*value:\s*"false"/);
  assert.match(yaml, /CALENDAR_ADAPTERS_ENABLED[\s\S]*value:\s*"false"/);
  assert.match(yaml, /CALENDAR_ADAPTER_PROVIDER[\s\S]*value:\s*"mock"/);
  assert.equal((yaml.match(/^\s+plan:\s*free$/gm) || []).length, 4);
  assert.doesNotMatch(yaml, /name:\s*maintenanceos-redteam/);
  assert.doesNotMatch(yaml, /plan:\s*starter/i);
  assert.doesNotMatch(yaml, /SECRET|TOKEN|PASSWORD|API_KEY/);
});

test("sandbox-test-call Dockerfile matches npm run sandbox-test-call", () => {
  const docker = read("packages/sandbox-test-call/Dockerfile");
  const pkg = JSON.parse(read("package.json"));
  assert.equal(
    pkg.scripts["sandbox-test-call"],
    "node --experimental-strip-types packages/sandbox-test-call/src/server.ts",
  );
  assert.match(docker, /FROM node:22-bookworm-slim/);
  assert.match(
    docker,
    /CMD \["node", "--experimental-strip-types", "packages\/sandbox-test-call\/src\/server\.ts"\]/,
  );
  assert.match(docker, /SANDBOX_TEST_CALL_HOST=0\.0\.0\.0/);
  assert.match(docker, /packages\/receptionist-draft\/src/);
  assert.doesNotMatch(docker, /^ENV SANDBOX_TEST_CALL_ENABLED=/m);
  assert.doesNotMatch(docker, /^ENV ONBOARDING_SANDBOX_CALL=/m);
  assert.match(docker, /DigitalOcean App Platform/);
  assert.match(docker, /maintenanceos-redteam/);
});

test("calendar-adapters Dockerfile is mock-only and flag-off", () => {
  const docker = read("packages/calendar-adapters/Dockerfile");
  const pkg = JSON.parse(read("package.json"));
  assert.equal(
    pkg.scripts["calendar-adapters"],
    "node --experimental-strip-types packages/calendar-adapters/src/server.ts",
  );
  assert.match(docker, /FROM node:22-bookworm-slim/);
  assert.match(
    docker,
    /CMD \["node", "--experimental-strip-types", "packages\/calendar-adapters\/src\/server\.ts"\]/,
  );
  assert.match(docker, /CALENDAR_ADAPTERS_HOST=0\.0\.0\.0/);
  assert.match(docker, /CALENDAR_ADAPTER_PROVIDER=mock/);
  assert.doesNotMatch(docker, /^ENV CALENDAR_ADAPTERS_ENABLED=/m);
  assert.doesNotMatch(docker, /GOOGLE_|MICROSOFT_/);
  assert.match(docker, /DigitalOcean App Platform/);
  assert.match(docker, /maintenanceos-redteam/);
});

test("sandbox deploy runbook documents Free click, CORS, DO rebuild, honesty", () => {
  const doc = read("docs/SANDBOX_DEPLOY.md");
  assert.match(doc, /Instance type:\*\* click \*\*Free\*\*/);
  assert.match(doc, /Health Check Path:\*\* `\/health`/);
  assert.match(doc, /SANDBOX_TEST_CALL_ENABLED/);
  assert.match(doc, /seahorse-app-4oasq\.ondigitalocean\.app/);
  assert.match(doc, /NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT/);
  assert.match(doc, /NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED/);
  assert.match(doc, /Force Rebuild/);
  assert.match(doc, /not_configured/);
  assert.match(doc, /live_call_forbidden/);
  assert.match(doc, /maintenanceos-redteam/);
  assert.match(doc, /output: 'export'/);
  assert.match(doc, /\/v1\/sandbox/);
  assert.match(doc, /15 minutes/);
  assert.match(doc, /CALENDAR_ADAPTERS_ENABLED/);
  assert.match(doc, /NEXT_PUBLIC_CALENDAR_ENDPOINT/);
  assert.match(doc, /maintenanceos-calendar-adapters/);
  assert.match(doc, /src\/config\/site\.ts/);
});

test("site.ts public env names match the sandbox deploy runbook", () => {
  const site = read("src/config/site.ts");
  assert.match(site, /NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED/);
  assert.match(site, /NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT/);
  assert.match(site, /NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED/);
  assert.match(site, /NEXT_PUBLIC_CALENDAR_ENDPOINT/);
});

test("next.config static export is unchanged by the companion deploy path", () => {
  const text = read("next.config.ts");
  assert.match(text, /output:\s*["']export["']/);
});
