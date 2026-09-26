import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("render.yaml adds a free customer-dashboard companion, not voice", () => {
  const yaml = read("render.yaml");
  assert.match(yaml, /Not a DigitalOcean App Platform spec/);
  assert.match(yaml, /Not maintenanceos-redteam/);
  assert.match(yaml, /name:\s*maintenanceos-customer-dashboard/);
  assert.match(yaml, /dockerfilePath:\s*\.\/packages\/customer-dashboard\/Dockerfile/);
  assert.match(yaml, /CUSTOMER_DASHBOARD_HOST[\s\S]*value:\s*"0\.0\.0\.0"/);
  assert.match(yaml, /CUSTOMER_DASHBOARD_ENABLED[\s\S]*value:\s*"false"/);
  assert.match(yaml, /CUSTOMER_DASHBOARD_DEMO_DATA[\s\S]*value:\s*"true"/);
  assert.equal((yaml.match(/^\s+plan:\s*free$/gm) || []).length, 4);
  assert.doesNotMatch(yaml, /name:\s*maintenanceos-redteam/);
  assert.doesNotMatch(yaml, /plan:\s*starter/i);
  assert.doesNotMatch(yaml, /SECRET|TOKEN|PASSWORD|API_KEY/);
});

test("customer-dashboard Dockerfile matches npm run customer-dashboard", () => {
  const docker = read("packages/customer-dashboard/Dockerfile");
  const pkg = JSON.parse(read("package.json"));
  assert.equal(
    pkg.scripts["customer-dashboard"],
    "node --experimental-strip-types packages/customer-dashboard/src/server.ts",
  );
  assert.match(docker, /FROM node:22-bookworm-slim/);
  assert.match(
    docker,
    /CMD \["node", "--experimental-strip-types", "packages\/customer-dashboard\/src\/server\.ts"\]/,
  );
  assert.match(docker, /CUSTOMER_DASHBOARD_HOST=0\.0\.0\.0/);
  assert.doesNotMatch(docker, /^ENV CUSTOMER_DASHBOARD_ENABLED=/m);
  assert.match(docker, /DigitalOcean App Platform/);
  assert.match(docker, /maintenanceos-redteam/);
  assert.match(docker, /SAMPLE/);
});

test("dashboard deploy policy is DigitalOcean-only and keeps SAMPLE honesty", () => {
  const doc = read("docs/DASHBOARD_DEPLOY.md");
  assert.match(doc, /do not use Render/i);
  assert.match(doc, /DigitalOcean/);
  assert.match(doc, /GET \/health/);
  assert.match(doc, /CUSTOMER_DASHBOARD_ENABLED/);
  assert.match(doc, /CUSTOMER_DASHBOARD_DEMO_DATA/);
  assert.match(doc, /NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT/);
  assert.match(doc, /NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED/);
  assert.match(doc, /Force Rebuild/);
  assert.match(doc, /SAMPLE/);
  assert.match(doc, /production analytics/);
  assert.match(doc, /maintenanceos-redteam/);
  assert.match(doc, /output: 'export'/);
  assert.match(doc, /\/v1\/dashboard/);
  assert.match(doc, /src\/config\/site\.ts/);
  assert.match(doc, /CUSTOMER_DASHBOARD_CORS_ORIGIN/);
  assert.doesNotMatch(doc, /onrender\.com|Render Dashboard|New \+.*Web Service/i);
});

test("site.ts public env names match the dashboard deploy runbook", () => {
  const site = read("src/config/site.ts");
  assert.match(site, /NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED/);
  assert.match(site, /NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT/);
});

test("next.config static export is unchanged by the companion deploy path", () => {
  const text = read("next.config.ts");
  assert.match(text, /output:\s*["']export["']/);
});
