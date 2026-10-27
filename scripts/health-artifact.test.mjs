import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(ROOT, "scripts/write-health-artifact.mjs");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const suite = fs.readFileSync(
  path.join(ROOT, "scripts/observability-suite.test.mjs"),
  "utf8",
);

test("package exposes health:artifact script", () => {
  assert.equal(pkg.scripts["health:artifact"], "node scripts/write-health-artifact.mjs");
});

test("offline health artifact records SHA without network probes", () => {
  const out = path.join(os.tmpdir(), `mw-health-artifact-${process.pid}.json`);
  const env = { ...process.env, HEALTH_ARTIFACT_PATH: out };
  delete env.WEBSITE_CONTROL_PLANE;
  const result = spawnSync(process.execPath, [script], {
    cwd: ROOT,
    encoding: "utf8",
    env,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const artifact = JSON.parse(fs.readFileSync(out, "utf8"));
  assert.equal(artifact.schema, 1);
  assert.equal(artifact.kind, "offline-health-artifact");
  assert.equal(artifact.network, false);
  assert.equal(artifact.mode, "offline-config");
  assert.match(artifact.head, /^[0-9a-f]{7,40}$/);
  assert.equal(artifact.defaultOrigin, "https://worksmartos.co.uk");
  assert.equal(artifact.controlPlaneConfigured, false);
  assert.equal(artifact.controlPlaneOptInOnly, true);
  assert.equal(artifact.retiredRailwayDefaultAbsent, true);
  assert.equal(artifact.ok, true);
  assert.ok(artifact.bans.some((b) => /no live HTTP probe/i.test(b)));
  assert.doesNotMatch(JSON.stringify(artifact), /railway\.app/i);
  assert.doesNotMatch(JSON.stringify(artifact), /0151\s*321\s*1920/);
  fs.unlinkSync(out);
});

test("observability suite still locks monitor opt-in control plane", () => {
  assert.match(suite, /WEBSITE_CONTROL_PLANE/);
  assert.match(suite, /worksmartos\.co\.uk/);
});
